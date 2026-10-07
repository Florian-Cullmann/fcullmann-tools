import { PDFDocument } from "pdf-lib";
import { hasSafeImageDimensions, validateImageFile } from "@/lib/tools/images";
import { getPdfImageLayout } from "@/lib/tools/pdf-images";
import type { ImagePdfErrorReason, ImagePdfRequest, ImagePdfResponse } from "./image-pdf-messages";

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<ImagePdfRequest>) => void) | null;
  postMessage: (message: ImagePdfResponse, transfer?: Transferable[]) => void;
};

const MAX_PAGE_BYTES = 2_000_000;
// Leave room for PDF objects, page instructions and document metadata.
const MAX_JPEG_BYTES = MAX_PAGE_BYTES - 100_000;
const OUTPUT_DPI = 240;
const MAX_OUTPUT_SIDE = 3200;
const MAX_OUTPUT_PIXELS = 8_000_000;

class ProcessingError extends Error {
  constructor(public reason: ImagePdfErrorReason) {
    super(reason);
  }
}

async function renderJpeg(bitmap: ImageBitmap, width: number, height: number, quality: number) {
  const canvas = new OffscreenCanvas(width, height);
  try {
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new ProcessingError("browser");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    if (blob.type !== "image/jpeg") throw new ProcessingError("browser");
    return blob;
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

async function compressPage(bitmap: ImageBitmap, width: number, height: number) {
  let scale = Math.min(
    1,
    width / bitmap.width,
    height / bitmap.height,
    MAX_OUTPUT_SIDE / Math.max(bitmap.width, bitmap.height),
    Math.sqrt(MAX_OUTPUT_PIXELS / (bitmap.width * bitmap.height)),
  );
  // Prefer high quality. Only reduce dimensions further for unusually complex images.
  for (let attempt = 0; attempt < 12; attempt += 1) {
    for (const quality of [0.92, 0.86, 0.8]) {
      const blob = await renderJpeg(
        bitmap,
        Math.max(1, Math.round(bitmap.width * scale)),
        Math.max(1, Math.round(bitmap.height * scale)),
        quality,
      );
      if (blob.size <= MAX_JPEG_BYTES) return blob;
    }
    scale *= 0.8;
  }
  throw new ProcessingError("size");
}

scope.onmessage = async ({ data }) => {
  let fileName = "";
  try {
    if (typeof OffscreenCanvas === "undefined" || typeof createImageBitmap === "undefined") {
      throw new ProcessingError("browser");
    }
    if (!data.files.length) throw new ProcessingError("read");
    const document = data.kind === "convert" ? await PDFDocument.create() : null;
    document?.setCreator("fcullmann.com Tools");
    document?.setProducer("fcullmann.com Tools");

    // Decode only one original at a time, entirely outside the UI thread.
    for (let index = 0; index < data.files.length; index += 1) {
      const file = data.files[index];
      fileName = file.name;
      if (!(await validateImageFile(file)).ok) throw new ProcessingError("unsupported");
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      try {
        if (!hasSafeImageDimensions(bitmap.width, bitmap.height)) throw new ProcessingError("dimensions");
        if (data.kind === "prepare") {
          const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
          const preview = await renderJpeg(
            bitmap,
            Math.max(1, Math.round(bitmap.width * scale)),
            Math.max(1, Math.round(bitmap.height * scale)),
            0.75,
          );
          scope.postMessage({ kind: "preview", index, width: bitmap.width, height: bitmap.height, preview });
        } else if (document) {
          const layout = getPdfImageLayout(bitmap, data.options);
          const jpeg = await compressPage(bitmap, layout.imageWidth * OUTPUT_DPI / 72, layout.imageHeight * OUTPUT_DPI / 72);
          const image = await document.embedJpg(await jpeg.arrayBuffer());
          const page = document.addPage([layout.pageWidth, layout.pageHeight]);
          page.drawImage(image, { x: layout.x, y: layout.y, width: layout.imageWidth, height: layout.imageHeight });
        }
      } finally {
        bitmap.close();
      }
      scope.postMessage({ kind: "progress", completed: index + 1, total: data.files.length });
    }

    if (document) {
      const bytes = await document.save({ useObjectStreams: true });
      if (bytes.byteLength > data.files.length * MAX_PAGE_BYTES) throw new ProcessingError("size");
      const buffer = Uint8Array.from(bytes).buffer;
      scope.postMessage({ kind: "pdf", buffer }, [buffer]);
    } else {
      scope.postMessage({ kind: "done" });
    }
  } catch (error) {
    scope.postMessage({ kind: "error", reason: error instanceof ProcessingError ? error.reason : "read", fileName });
  }
};
