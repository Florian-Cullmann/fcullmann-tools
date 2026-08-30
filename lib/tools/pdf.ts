import { PDFDocument } from "pdf-lib";

export type PdfPageRange = {
  start: number;
  end: number;
};

export type PdfSplitPointErrorCode =
  | "document-too-short"
  | "required"
  | "invalid"
  | "out-of-range"
  | "duplicate"
  | "too-many";

export class PdfSplitPointError extends Error {
  constructor(public readonly code: PdfSplitPointErrorCode) {
    super(code);
    this.name = "PdfSplitPointError";
  }
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

export function parsePdfSplitPoints(
  input: string,
  pageCount: number,
  maxParts = 100,
) {
  if (pageCount < 2) throw new PdfSplitPointError("document-too-short");

  const tokens = input
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens.length) throw new PdfSplitPointError("required");
  if (tokens.some((token) => !/^\d+$/.test(token))) {
    throw new PdfSplitPointError("invalid");
  }

  const points = tokens.map(Number);
  if (points.some((point) => point < 1 || point >= pageCount)) {
    throw new PdfSplitPointError("out-of-range");
  }
  if (new Set(points).size !== points.length) {
    throw new PdfSplitPointError("duplicate");
  }
  if (points.length + 1 > maxParts) {
    throw new PdfSplitPointError("too-many");
  }

  return points.sort((left, right) => left - right);
}

export function getPdfPageRanges(
  pageCount: number,
  splitPoints: ReadonlyArray<number>,
): PdfPageRange[] {
  const boundaries = [...splitPoints, pageCount];
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
