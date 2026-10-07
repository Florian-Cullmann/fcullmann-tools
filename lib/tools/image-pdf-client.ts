import type { JpgToPdfOptions } from "@/lib/tools/pdf-images";
import type { ImagePdfErrorReason, ImagePdfRequest, ImagePdfResponse } from "./image-pdf-messages";

export type PreparedPdfImage = {
  file: File;
  width: number;
  height: number;
  preview: Blob;
};

export class ImagePdfProcessingError extends Error {
  constructor(public reason: ImagePdfErrorReason, public fileName: string) {
    super(reason);
  }
}

type TaskOptions = {
  signal: AbortSignal;
  onProgress: (completed: number, total: number) => void;
};

function runTask(request: ImagePdfRequest, options: TaskOptions, onPreview?: (message: Extract<ImagePdfResponse, { kind: "preview" }>) => void) {
  return new Promise<ArrayBuffer | undefined>((resolve, reject) => {
    const worker = new Worker(new URL("./image-pdf.worker.ts", import.meta.url), { type: "module" });
    function dispose() {
      options.signal.removeEventListener("abort", abort);
      worker.terminate();
    }
    function abort() {
      dispose();
      reject(new DOMException("Cancelled", "AbortError"));
    }
    worker.onmessage = ({ data }: MessageEvent<ImagePdfResponse>) => {
      if (data.kind === "preview") onPreview?.(data);
      else if (data.kind === "progress") options.onProgress(data.completed, data.total);
      else if (data.kind === "error") {
        dispose();
        reject(new ImagePdfProcessingError(data.reason, data.fileName));
      } else {
        dispose();
        resolve(data.kind === "pdf" ? data.buffer : undefined);
      }
    };
    worker.onerror = () => {
      dispose();
      reject(new ImagePdfProcessingError("read", ""));
    };
    options.signal.addEventListener("abort", abort, { once: true });
    if (options.signal.aborted) abort();
    else worker.postMessage(request);
  });
}

export async function preparePdfImages(files: File[], options: TaskOptions) {
  const images: PreparedPdfImage[] = [];
  await runTask({ kind: "prepare", files }, options, ({ index, width, height, preview }) => {
    images.push({ file: files[index], width, height, preview });
  });
  return images;
}

export async function createImagePdf(files: File[], pdfOptions: JpgToPdfOptions, options: TaskOptions & { maxBytes: number }) {
  const buffer = await runTask({ kind: "convert", files, options: pdfOptions, maxBytes: options.maxBytes }, options);
  if (!buffer) throw new ImagePdfProcessingError("read", "");
  return buffer;
}
