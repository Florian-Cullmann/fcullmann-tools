import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
} from "pdf-lib";

export type PdfPageRange = {
  start: number;
  end: number;
};

export type PdfPageOperation = Readonly<{
  sourceIndex: number;
  rotation: number;
}>;

export type PdfPageNumberPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type PdfPageNumberFormat = "number" | "number-total" | "page-total";

export type PdfPageNumberOptions = Readonly<{
  fromPage: number;
  toPage: number;
  startNumber: number;
  fontSize: number;
  position: PdfPageNumberPosition;
  format: PdfPageNumberFormat;
  pageLabel: string;
  ofLabel: string;
}>;

export function normalizePdfRotation(angle: number) {
  return ((Math.round(angle / 90) * 90) % 360 + 360) % 360;
}

export async function getPdfPageCount(data: ArrayBuffer | Uint8Array) {
  const document = await PDFDocument.load(data, { updateMetadata: false });
  return document.getPageCount();
}

export async function mergePdfDocuments(
  documents: ReadonlyArray<ArrayBuffer | Uint8Array>,
) {
  if (documents.length < 2) {
    throw new Error("At least two PDF documents are required.");
  }

  const merged = await PDFDocument.create();

  for (const data of documents) {
    const source = await PDFDocument.load(data, { updateMetadata: false });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return merged.save({ useObjectStreams: true });
}

export function getPdfPageRanges(
  pageCount: number,
  splitPoints: ReadonlyArray<number>,
): PdfPageRange[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new RangeError("PDF page count must be a positive integer.");
  }

  const boundaries = [...new Set(splitPoints)].sort(
    (left, right) => left - right,
  );
  if (
    boundaries.some(
      (point) =>
        !Number.isInteger(point) || point < 1 || point >= pageCount,
    )
  ) {
    throw new RangeError("PDF split point is outside the document.");
  }

  boundaries.push(pageCount);
  let start = 1;

  return boundaries.map((end) => {
    const range = { start, end };
    start = end + 1;
    return range;
  });
}

export async function splitPdfDocument(
  data: ArrayBuffer | Uint8Array,
  ranges: ReadonlyArray<PdfPageRange>,
) {
  if (ranges.length < 2) {
    throw new Error("At least two PDF page ranges are required.");
  }

  const source = await PDFDocument.load(data, { updateMetadata: false });
  const pageCount = source.getPageCount();
  const parts: Uint8Array[] = [];

  for (const range of ranges) {
    if (
      !Number.isInteger(range.start) ||
      !Number.isInteger(range.end) ||
      range.start < 1 ||
      range.end < range.start ||
      range.end > pageCount
    ) {
      throw new RangeError("PDF page range is outside the document.");
    }

    const part = await PDFDocument.create();
    const indices = Array.from(
      { length: range.end - range.start + 1 },
      (_, index) => range.start - 1 + index,
    );
    const pages = await part.copyPages(source, indices);
    pages.forEach((page) => part.addPage(page));
    parts.push(await part.save({ useObjectStreams: true }));
  }

  return parts;
}

export async function rotatePdfDocument(
  data: ArrayBuffer | Uint8Array,
  rotations: ReadonlyArray<number>,
) {
  const document = await PDFDocument.load(data, { updateMetadata: false });
  const pages = document.getPages();

  if (rotations.length !== pages.length) {
    throw new RangeError("A rotation is required for every PDF page.");
  }

  pages.forEach((page, index) => {
    page.setRotation(
      degrees(
        normalizePdfRotation(page.getRotation().angle + rotations[index]),
      ),
    );
  });

  return document.save({ useObjectStreams: true });
}

export async function organizePdfDocument(
  data: ArrayBuffer | Uint8Array,
  operations: ReadonlyArray<PdfPageOperation>,
) {
  if (!operations.length) {
    throw new Error("At least one PDF page is required.");
  }

  const source = await PDFDocument.load(data, { updateMetadata: false });
  const pageCount = source.getPageCount();
  const indices = operations.map(({ sourceIndex }) => sourceIndex);

  if (
    indices.some(
      (index) => !Number.isInteger(index) || index < 0 || index >= pageCount,
    ) ||
    new Set(indices).size !== indices.length
  ) {
    throw new RangeError("The PDF page order is invalid.");
  }

  const organized = await PDFDocument.create();
  const pages = await organized.copyPages(source, indices);
  pages.forEach((page, index) => {
    const rotation = operations[index].rotation;
    page.setRotation(
      degrees(normalizePdfRotation(page.getRotation().angle + rotation)),
    );
    organized.addPage(page);
  });

  return organized.save({ useObjectStreams: true });
}

export function getPdfPageNumberText(
  number: number,
  total: number,
  options: Pick<PdfPageNumberOptions, "format" | "pageLabel" | "ofLabel">,
) {
  if (options.format === "number-total") return `${number} / ${total}`;
  if (options.format === "page-total") {
    return `${options.pageLabel} ${number} ${options.ofLabel} ${total}`;
  }
  return String(number);
}

function getPageNumberCoordinates(
  pageWidth: number,
  pageHeight: number,
  pageRotation: number,
  textWidth: number,
  fontSize: number,
  position: PdfPageNumberPosition,
) {
  const rotation = normalizePdfRotation(pageRotation);
  const visibleWidth = rotation % 180 === 0 ? pageWidth : pageHeight;
  const visibleHeight = rotation % 180 === 0 ? pageHeight : pageWidth;
  const [vertical, horizontal] = position.split("-") as [
    "top" | "bottom",
    "left" | "center" | "right",
  ];
  const margin = Math.max(24, fontSize * 1.8);
  const visibleX =
    horizontal === "left"
      ? margin
      : horizontal === "right"
        ? visibleWidth - margin - textWidth
        : (visibleWidth - textWidth) / 2;
  const visibleY =
    vertical === "top" ? visibleHeight - margin - fontSize : margin;

  if (rotation === 90) {
    return { x: pageWidth - visibleY, y: visibleX, rotation };
  }
  if (rotation === 180) {
    return {
      x: pageWidth - visibleX,
      y: pageHeight - visibleY,
      rotation,
    };
  }
  if (rotation === 270) {
    return { x: visibleY, y: pageHeight - visibleX, rotation };
  }
  return { x: visibleX, y: visibleY, rotation };
}

export async function addPdfPageNumbers(
  data: ArrayBuffer | Uint8Array,
  options: PdfPageNumberOptions,
) {
  const document = await PDFDocument.load(data, { updateMetadata: false });
  const pages = document.getPages();

  if (
    !Number.isInteger(options.fromPage) ||
    !Number.isInteger(options.toPage) ||
    options.fromPage < 1 ||
    options.toPage < options.fromPage ||
    options.toPage > pages.length
  ) {
    throw new RangeError("The PDF page range is invalid.");
  }
  if (!Number.isInteger(options.startNumber) || options.startNumber < 0) {
    throw new RangeError("The first page number must be a positive integer.");
  }
  if (!Number.isFinite(options.fontSize) || options.fontSize < 6 || options.fontSize > 48) {
    throw new RangeError("The page number font size is invalid.");
  }

  const font = await document.embedFont(StandardFonts.Helvetica);
  const total = options.startNumber + options.toPage - options.fromPage;

  for (let pageIndex = options.fromPage - 1; pageIndex < options.toPage; pageIndex += 1) {
    const page = pages[pageIndex];
    const number = options.startNumber + pageIndex - (options.fromPage - 1);
    const text = getPdfPageNumberText(number, total, options);
    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    const { x, y, rotation } = getPageNumberCoordinates(
      page.getWidth(),
      page.getHeight(),
      page.getRotation().angle,
      textWidth,
      options.fontSize,
      options.position,
    );

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.12, 0.13, 0.16),
      rotate: degrees(rotation),
    });
  }

  return document.save({ useObjectStreams: true });
}
