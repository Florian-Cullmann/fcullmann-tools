export const MAX_IMAGE_BYTES = 100 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;
export const MAX_IMAGE_SIDE = 16_384;

export const IMAGE_INPUT_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export type SupportedImageType = "jpeg" | "png" | "webp";
export type ImageOutputFormat = SupportedImageType;

const extensions: Record<SupportedImageType, readonly string[]> = {
  jpeg: ["jpg", "jpeg"],
  png: ["png"],
  webp: ["webp"],
};

const mimeTypes: Record<SupportedImageType, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export type ImageValidationResult =
  | { ok: true; type: SupportedImageType }
  | { ok: false; reason: "empty" | "too-large" | "unsupported" };

export function detectImageType(bytes: Uint8Array): SupportedImageType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

function fileExtension(fileName: string) {
  return fileName.toLocaleLowerCase("en").split(".").pop() ?? "";
}

export async function validateImageFile(
  file: Pick<File, "name" | "size" | "type" | "slice">,
): Promise<ImageValidationResult> {
  if (file.size === 0) return { ok: false, reason: "empty" };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, reason: "too-large" };

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const detected = detectImageType(header);
  if (!detected) return { ok: false, reason: "unsupported" };

  const extensionMatches = extensions[detected].includes(
    fileExtension(file.name),
  );
  const mimeMatches =
    !file.type || file.type.toLocaleLowerCase("en") === mimeTypes[detected];

  return extensionMatches && mimeMatches
    ? { ok: true, type: detected }
    : { ok: false, reason: "unsupported" };
}

export function imageOutputFileName(
  sourceName: string,
  format: ImageOutputFormat,
) {
  const baseName = sourceName.replace(/\.[^.]+$/, "").trim() || "image";
  const extension = format === "jpeg" ? "jpg" : format;
  return `${baseName}.${extension}`;
}

export function hasSafeImageDimensions(width: number, height: number) {
  return (
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width > 0 &&
    height > 0 &&
    width <= MAX_IMAGE_SIDE &&
    height <= MAX_IMAGE_SIDE &&
    width * height <= MAX_IMAGE_PIXELS
  );
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== type) {
          reject(new Error(`The browser cannot create ${type} images.`));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export async function readImageDimensions(file: Blob) {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const dimensions = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dimensions;
}

export async function convertImage(
  file: Blob,
  format: ImageOutputFormat,
  quality = 0.9,
) {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  try {
    if (!hasSafeImageDimensions(bitmap.width, bitmap.height)) {
      throw new RangeError("Image dimensions exceed the safe canvas limit.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { alpha: format !== "jpeg" });
    if (!context) throw new Error("Canvas is not available.");

    if (format === "jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(bitmap, 0, 0);

    return await canvasToBlob(canvas, mimeTypes[format], quality);
  } finally {
    bitmap.close();
  }
}
