import type { PDFPageProxy } from "pdfjs-dist";

export type PdfCompressionLevel = "small" | "balanced" | "high";

export type PdfCompressionProgress = Readonly<{
  completedPages: number;
  totalPages: number;
}>;

const MAX_PAGE_PIXELS = 6_000_000;

export const PDF_COMPRESSION_PRESETS = Object.freeze({
  small: { dpi: 108, jpegQuality: 0.58 },
  balanced: { dpi: 144, jpegQuality: 0.72 },
  high: { dpi: 180, jpegQuality: 0.84 },
} satisfies Record<
  PdfCompressionLevel,
  Readonly<{ dpi: number; jpegQuality: number }>
>);

export function getPdfCompressionScale(
  pageWidth: number,
  pageHeight: number,
  level: PdfCompressionLevel,
) {
  if (
    !Number.isFinite(pageWidth) ||
    !Number.isFinite(pageHeight) ||
    pageWidth <= 0 ||
    pageHeight <= 0
  ) {
    throw new RangeError("PDF page dimensions must be positive numbers.");
  }

  const targetScale = PDF_COMPRESSION_PRESETS[level].dpi / 72;
  const pixelLimitedScale = Math.sqrt(
    MAX_PAGE_PIXELS / (pageWidth * pageHeight),
  );

  return Math.min(targetScale, pixelLimitedScale);
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The rendered PDF page could not be encoded."));
          return;
        }
        void blob.arrayBuffer().then(resolve, reject);
      },
      "image/jpeg",
      quality,
    );
  });
}

async function renderPage(
  page: PDFPageProxy,
  level: PdfCompressionLevel,
) {
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = getPdfCompressionScale(
    baseViewport.width,
    baseViewport.height,
    level,
  );
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas rendering is unavailable.");

  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  try {
    await page.render({ canvas, viewport, background: "#ffffff" }).promise;
    const jpeg = await canvasToJpeg(
      canvas,
      PDF_COMPRESSION_PRESETS[level].jpegQuality,
    );
    return {
      jpeg,
      width: baseViewport.width,
      height: baseViewport.height,
    };
  } finally {
    canvas.width = 1;
    canvas.height = 1;
    page.cleanup();
  }
}

export async function compressPdfDocument(
  data: ArrayBuffer | Uint8Array,
  level: PdfCompressionLevel,
  onProgress?: (progress: PdfCompressionProgress) => void,
) {
  if (typeof document === "undefined") {
    throw new Error("PDF compression requires a browser environment.");
  }

  const [{ default: PDFDocument }, pdfjs] = await Promise.all([
    import("pdf-lib").then((module) => ({ default: module.PDFDocument })),
    import("pdfjs-dist/webpack.mjs"),
  ]);
  const sourceBytes =
    data instanceof Uint8Array ? Uint8Array.from(data) : new Uint8Array(data);
  const loadingTask = pdfjs.getDocument({ data: Uint8Array.from(sourceBytes) });

  try {
    const source = await loadingTask.promise;
    const output = await PDFDocument.create();
    const totalPages = source.numPages;
    onProgress?.({ completedPages: 0, totalPages });

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      const page = await source.getPage(pageNumber);
      const rendered = await renderPage(page, level);
      const image = await output.embedJpg(rendered.jpeg);
      const outputPage = output.addPage([rendered.width, rendered.height]);
      outputPage.drawImage(image, {
        x: 0,
        y: 0,
        width: rendered.width,
        height: rendered.height,
      });
      onProgress?.({ completedPages: pageNumber, totalPages });
    }

    return output.save({ useObjectStreams: true });
  } finally {
    await loadingTask.destroy();
  }
}
