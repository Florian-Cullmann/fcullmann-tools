import { PageSizes, PDFDocument } from "pdf-lib";
import { detectImageType } from "@/lib/tools/images";

export type PdfImagePageSize = "a4" | "letter" | "fit";
export type PdfImageOrientation = "auto" | "portrait" | "landscape";
export type PdfImageMargin = "none" | "small" | "standard";

type PdfImageSources = ReadonlyArray<ArrayBuffer | Uint8Array> | AsyncIterable<ArrayBuffer | Uint8Array>;

export type JpgToPdfOptions = Readonly<{
  pageSize: PdfImagePageSize;
  orientation: PdfImageOrientation;
  margin: PdfImageMargin;
}>;

export type ImageDimensions = Readonly<{
  width: number;
  height: number;
}>;

export type PdfImageLayout = Readonly<{
  pageWidth: number;
  pageHeight: number;
  imageWidth: number;
  imageHeight: number;
  x: number;
  y: number;
}>;

const IMAGE_POINT_SCALE = 72 / 96;

export const pdfImageMargins: Record<PdfImageMargin, number> = {
  none: 0,
  small: 18,
  standard: 36,
};

function orientPage(
  width: number,
  height: number,
  orientation: PdfImageOrientation,
  image: ImageDimensions,
) {
  const resolved =
    orientation === "auto"
      ? image.width > image.height
        ? "landscape"
        : "portrait"
      : orientation;
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);

  return resolved === "landscape"
    ? { width: longSide, height: shortSide }
    : { width: shortSide, height: longSide };
}

export function getPdfImageLayout(
  image: ImageDimensions,
  options: JpgToPdfOptions,
): PdfImageLayout {
  if (
    !Number.isFinite(image.width) ||
    !Number.isFinite(image.height) ||
    image.width <= 0 ||
    image.height <= 0
  ) {
    throw new RangeError("Image dimensions must be positive numbers.");
  }

  const margin = pdfImageMargins[options.margin];
  const baseSize =
    options.pageSize === "fit"
      ? {
          width: image.width * IMAGE_POINT_SCALE + margin * 2,
          height: image.height * IMAGE_POINT_SCALE + margin * 2,
        }
      : options.pageSize === "letter"
        ? { width: PageSizes.Letter[0], height: PageSizes.Letter[1] }
        : { width: PageSizes.A4[0], height: PageSizes.A4[1] };
  const page = orientPage(
    baseSize.width,
    baseSize.height,
    options.orientation,
    image,
  );
  const availableWidth = page.width - margin * 2;
  const availableHeight = page.height - margin * 2;

  if (availableWidth <= 0 || availableHeight <= 0) {
    throw new RangeError("The selected margin does not fit on the page.");
  }

  const scale = Math.min(
    availableWidth / image.width,
    availableHeight / image.height,
  );
  const imageWidth = image.width * scale;
  const imageHeight = image.height * scale;

  return {
    pageWidth: page.width,
    pageHeight: page.height,
    imageWidth,
    imageHeight,
    x: (page.width - imageWidth) / 2,
    y: (page.height - imageHeight) / 2,
  };
}

export async function createPdfFromJpgs(
  images: PdfImageSources,
  options: JpgToPdfOptions,
) {
  return createPdfFromImages(images, options);
}

export async function createPdfFromImages(
  images: PdfImageSources,
  options: JpgToPdfOptions,
) {
  const document = await PDFDocument.create();
  document.setCreator("fcuTools");
  document.setProducer("fcuTools");

  let imageCount = 0;
  for await (const source of images) {
    const bytes = source instanceof Uint8Array ? Uint8Array.from(source) : new Uint8Array(source);
    const type = detectImageType(bytes);
    if (type !== "jpeg" && type !== "png") {
      throw new Error("Images must be JPEG or PNG before embedding in PDF.");
    }
    const image = type === "png"
      ? await document.embedPng(bytes)
      : await document.embedJpg(bytes);
    const layout = getPdfImageLayout(image, options);
    const page = document.addPage([layout.pageWidth, layout.pageHeight]);
    page.drawImage(image, {
      x: layout.x,
      y: layout.y,
      width: layout.imageWidth,
      height: layout.imageHeight,
    });
    imageCount += 1;
  }

  if (!imageCount) throw new Error("At least one image is required.");

  return document.save({ useObjectStreams: true });
}

export function getPdfPageRenderScale(
  width: number,
  height: number,
  dpi: number,
  maxDimension = 6000,
) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    !Number.isFinite(dpi) ||
    dpi <= 0
  ) {
    throw new RangeError("Page dimensions and DPI must be positive numbers.");
  }

  const requestedScale = dpi / 72;
  const longestSide = Math.max(width, height);
  return Math.min(requestedScale, maxDimension / longestSide);
}
