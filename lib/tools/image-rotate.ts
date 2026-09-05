import {
  hasSafeImageDimensions,
  MAX_IMAGE_BYTES,
  validateImageFile,
} from "./images";

export type Rotation = 90 | 180 | 270;
export type OrientationFilter = "all" | "landscape" | "portrait";
export const ROTATION_ACCEPT =
  "image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif";
export const MAX_ROTATION_FILES = 30;

export function matchesOrientation(
  width: number,
  height: number,
  filter: OrientationFilter,
) {
  return (
    filter === "all" ||
    (filter === "landscape" ? width > height : height > width)
  );
}

export function rotatedPoint(
  x: number,
  y: number,
  width: number,
  height: number,
  angle: Rotation,
) {
  if (angle === 90) return { x: height - 1 - y, y: x };
  if (angle === 180) return { x: width - 1 - x, y: height - 1 - y };
  return { x: y, y: width - 1 - x };
}

export async function rotationImageType(
  file: File,
): Promise<"jpeg" | "png" | "gif"> {
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error("size");
  const header = new Uint8Array(await file.slice(0, 6).arrayBuffer());
  const signature = String.fromCharCode(...header);
  if (
    (signature === "GIF87a" || signature === "GIF89a") &&
    /\.gif$/i.test(file.name) &&
    (!file.type || file.type === "image/gif")
  )
    return "gif";
  const validation = await validateImageFile(file);
  if (!validation.ok || validation.type === "webp") throw new Error("type");
  return validation.type;
}

// Rotate each GIF frame rectangle independently, preserving timing, disposal,
// palettes and offsets so partial frames retain their animation semantics.
export async function rotateGif(bytes: Uint8Array, angle: Rotation) {
  const { GifReader, GifWriter } = await import("omggif");
  const reader = new GifReader(bytes);
  const { width, height } = reader;
  if (
    !hasSafeImageDimensions(width, height) ||
    !reader.numFrames() ||
    width * height * reader.numFrames() > 100_000_000
  )
    throw new Error("GIF limit");
  const paletteAt = (offset: number, size: number) =>
    Array.from(
      { length: size },
      (_, i) =>
        (bytes[offset + i * 3] << 16) |
        (bytes[offset + i * 3 + 1] << 8) |
        bytes[offset + i * 3 + 2],
    );
  const globalPalette =
    bytes[10] & 128 ? paletteAt(13, 1 << ((bytes[10] & 7) + 1)) : undefined;
  const output = new Uint8Array(
    Math.min(
      MAX_IMAGE_BYTES,
      width * height * reader.numFrames() * 2 +
        reader.numFrames() * 1024 +
        1024,
    ),
  );
  const writer = new GifWriter(
    output,
    angle === 180 ? width : height,
    angle === 180 ? height : width,
    {
      palette: globalPalette,
      ...(globalPalette && bytes[11] ? { background: bytes[11] } : {}),
      ...(reader.loopCount() !== null ? { loop: reader.loopCount() } : {}),
    },
  );
  const rgba = new Uint8Array(width * height * 4);
  for (let index = 0; index < reader.numFrames(); index++) {
    const frame = reader.frameInfo(index);
    if (frame.x + frame.width > width || frame.y + frame.height > height)
      throw new Error("Invalid GIF frame");
    if (frame.palette_offset === null || frame.palette_size === null)
      throw new Error("Missing GIF palette");
    rgba.fill(0);
    reader.decodeAndBlitFrameRGBA(index, rgba);
    const palette = paletteAt(frame.palette_offset, frame.palette_size);
    const colors = new Map<number, number>();
    palette.forEach((color, i) => {
      if (i !== frame.transparent_index) colors.set(color, i);
    });
    const frameWidth = angle === 180 ? frame.width : frame.height;
    const pixels = new Uint8Array(frame.width * frame.height);
    for (let y = 0; y < frame.height; y++) {
      for (let x = 0; x < frame.width; x++) {
        const source = ((frame.y + y) * width + frame.x + x) * 4;
        const point = rotatedPoint(x, y, frame.width, frame.height, angle);
        const color =
          (rgba[source] << 16) | (rgba[source + 1] << 8) | rgba[source + 2];
        pixels[point.y * frameWidth + point.x] =
          rgba[source + 3] === 0
            ? (frame.transparent_index ?? 0)
            : (colors.get(color) ?? 0);
      }
    }
    const x =
      angle === 90
        ? height - frame.y - frame.height
        : angle === 180
          ? width - frame.x - frame.width
          : frame.y;
    const y =
      angle === 90
        ? frame.x
        : angle === 180
          ? height - frame.y - frame.height
          : width - frame.x - frame.width;
    writer.addFrame(
      x,
      y,
      frameWidth,
      angle === 180 ? frame.height : frame.width,
      pixels,
      {
        palette,
        delay: frame.delay,
        disposal: frame.disposal,
        ...(frame.transparent_index !== null
          ? { transparent: frame.transparent_index }
          : {}),
      },
    );
    if (writer.getOutputBufferPosition() >= output.length)
      throw new Error("GIF limit");
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  const length = writer.end();
  return new Blob([output.slice(0, length)], { type: "image/gif" });
}

export async function rotateImage(file: File, angle: Rotation): Promise<Blob> {
  const type = await rotationImageType(file);
  if (type === "gif")
    return rotateGif(new Uint8Array(await file.arrayBuffer()), angle);
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const canvas = document.createElement("canvas");
  try {
    if (!hasSafeImageDimensions(bitmap.width, bitmap.height))
      throw new Error("Image limit");
    canvas.width = angle === 180 ? bitmap.width : bitmap.height;
    canvas.height = angle === 180 ? bitmap.height : bitmap.width;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((angle * Math.PI) / 180);
    context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => {
          if (blob?.type === `image/${type}`) resolve(blob);
          else reject(new Error("Export failed"));
        },
        `image/${type}`,
        0.92,
      ),
    );
  } finally {
    bitmap.close();
    canvas.width = canvas.height = 0;
  }
}
