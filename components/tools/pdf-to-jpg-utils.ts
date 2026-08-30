import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { getPdfPageRenderScale } from "@/lib/tools/pdf-images";

type PdfJsModule = typeof import("pdfjs-dist");

type PdfImageData = {
  width: number;
  height: number;
  kind?: number;
  data?: Uint8Array | Uint8ClampedArray;
  bitmap?: ImageBitmap;
};

export type JpegOutput = {
  blob: Blob;
  height: number;
  name: string;
  width: number;
};

export class PdfImageLimitError extends Error {
  constructor() {
    super("The PDF contains more exportable images than this tool supports.");
    this.name = "PdfImageLimitError";
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not create a JPG image."));
      },
      "image/jpeg",
      quality,
    );
  });
}

function resolvePdfObject(page: PDFPageProxy, objectId: string) {
  const objects = objectId.startsWith("g_") ? page.commonObjs : page.objs;
  return new Promise<PdfImageData>((resolve) => {
    objects.get(objectId, (value: PdfImageData) => resolve(value));
  });
}

function imageDataToCanvas(
  image: PdfImageData,
  imageKind: PdfJsModule["ImageKind"],
) {
  if (!image.width || !image.height) {
    throw new Error("The embedded image has invalid dimensions.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas is not available in this browser.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (image.bitmap) {
    context.drawImage(image.bitmap, 0, 0);
    return canvas;
  }

  if (!image.data || image.kind === undefined) {
    throw new Error("The embedded image data is unavailable.");
  }

  const rgba = new Uint8ClampedArray(image.width * image.height * 4);
  if (image.kind === imageKind.RGBA_32BPP) {
    rgba.set(image.data.subarray(0, rgba.length));
  } else if (image.kind === imageKind.RGB_24BPP) {
    for (
      let sourceIndex = 0, targetIndex = 0;
      targetIndex < rgba.length;
      sourceIndex += 3, targetIndex += 4
    ) {
      rgba[targetIndex] = image.data[sourceIndex] ?? 0;
      rgba[targetIndex + 1] = image.data[sourceIndex + 1] ?? 0;
      rgba[targetIndex + 2] = image.data[sourceIndex + 2] ?? 0;
      rgba[targetIndex + 3] = 255;
    }
  } else if (image.kind === imageKind.GRAYSCALE_1BPP) {
    const rowLength = Math.ceil(image.width / 8);
    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        const byte = image.data[y * rowLength + Math.floor(x / 8)] ?? 0;
        const value = byte & (1 << (7 - (x % 8))) ? 255 : 0;
        const targetIndex = (y * image.width + x) * 4;
        rgba[targetIndex] = value;
        rgba[targetIndex + 1] = value;
        rgba[targetIndex + 2] = value;
        rgba[targetIndex + 3] = 255;
      }
    }
  } else {
    throw new Error("The embedded image format is unsupported.");
  }

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.width;
  sourceCanvas.height = image.height;
  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) throw new Error("Canvas is not available in this browser.");
  sourceContext.putImageData(
    new ImageData(rgba, image.width, image.height),
    0,
    0,
  );
  context.drawImage(sourceCanvas, 0, 0);
  return canvas;
}

export async function renderPdfPagesAsJpegs({
  document,
  dpi,
  quality,
  baseName,
  onProgress,
}: {
  document: PDFDocumentProxy;
  dpi: number;
  quality: number;
  baseName: string;
  onProgress: (completed: number) => void;
}) {
  const outputs: JpegOutput[] = [];
  const digits = Math.max(3, String(document.numPages).length);

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = getPdfPageRenderScale(
      baseViewport.width,
      baseViewport.height,
      dpi,
    );
    const viewport = page.getViewport({ scale });
    const canvas = window.document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    await page.render({ canvas, viewport, background: "#ffffff" }).promise;
    const blob = await canvasToJpeg(canvas, quality);
    outputs.push({
      blob,
      width: canvas.width,
      height: canvas.height,
      name: `${baseName}-page-${String(pageNumber).padStart(digits, "0")}.jpg`,
    });
    page.cleanup();
    onProgress(pageNumber);
  }

  return outputs;
}

export async function extractPdfImagesAsJpegs({
  document,
  pdfjs,
  quality,
  baseName,
  maxImages,
  onProgress,
}: {
  document: PDFDocumentProxy;
  pdfjs: PdfJsModule;
  quality: number;
  baseName: string;
  maxImages: number;
  onProgress: (completed: number) => void;
}) {
  const outputs: JpegOutput[] = [];
  const namedImages = new Set<string>();
  const inlineImages = new WeakSet<object>();

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const operatorList = await page.getOperatorList();

    for (let index = 0; index < operatorList.fnArray.length; index += 1) {
      const operation = operatorList.fnArray[index];
      const args = operatorList.argsArray[index] ?? [];
      let image: PdfImageData | null = null;

      if (
        operation === pdfjs.OPS.paintImageXObject ||
        operation === pdfjs.OPS.paintImageXObjectRepeat
      ) {
        const objectId = args[0];
        if (typeof objectId !== "string" || namedImages.has(objectId)) continue;
        namedImages.add(objectId);
        image = await resolvePdfObject(page, objectId);
      } else if (
        operation === pdfjs.OPS.paintInlineImageXObject ||
        operation === pdfjs.OPS.paintInlineImageXObjectGroup
      ) {
        const candidate = args[0] as PdfImageData | undefined;
        if (!candidate || typeof candidate !== "object" || inlineImages.has(candidate)) {
          continue;
        }
        inlineImages.add(candidate);
        image = candidate;
      }

      if (!image) continue;
      if (outputs.length >= maxImages) throw new PdfImageLimitError();
      try {
        const canvas = imageDataToCanvas(image, pdfjs.ImageKind);
        const blob = await canvasToJpeg(canvas, quality);
        outputs.push({
          blob,
          width: canvas.width,
          height: canvas.height,
          name: `${baseName}-image-${String(outputs.length + 1).padStart(3, "0")}.jpg`,
        });
      } catch {
        // Some PDF image masks and exotic color spaces cannot be exported alone.
      }

    }

    page.cleanup();
    onProgress(pageNumber);
  }

  return outputs;
}
