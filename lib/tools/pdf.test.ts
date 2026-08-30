import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import {
  getPdfPageCount,
  getPdfPageRanges,
  mergePdfDocuments,
  parsePdfSplitPoints,
  PdfSplitPointError,
  splitPdfDocument,
} from "@/lib/tools/pdf";

async function createPdf(pageWidths: number[]) {
  const document = await PDFDocument.create();
  pageWidths.forEach((width) => document.addPage([width, 200]));
  return document.save();
}

describe("PDF tools", () => {
  it("reads the page count", async () => {
    const pdf = await createPdf([100, 200, 300]);

    await expect(getPdfPageCount(pdf)).resolves.toBe(3);
  });

  it("merges every page in document order", async () => {
    const first = await createPdf([100, 110]);
    const second = await createPdf([200]);

    const bytes = await mergePdfDocuments([first, second]);
    const merged = await PDFDocument.load(bytes);

    expect(merged.getPages().map((page) => page.getWidth())).toEqual([
      100, 110, 200,
    ]);
  });

  it("requires at least two documents", async () => {
    const pdf = await createPdf([100]);

    await expect(mergePdfDocuments([pdf])).rejects.toThrow(
      "At least two PDF documents are required.",
    );
  });

  it("creates ordered page ranges from unsorted split points", () => {
    const points = parsePdfSplitPoints("7, 3", 10);

    expect(points).toEqual([3, 7]);
    expect(getPdfPageRanges(10, points)).toEqual([
      { start: 1, end: 3 },
      { start: 4, end: 7 },
      { start: 8, end: 10 },
    ]);
  });

  it.each([
    ["", "required"],
    ["two", "invalid"],
    ["0", "out-of-range"],
    ["10", "out-of-range"],
    ["3, 3", "duplicate"],
  ] as const)("rejects invalid split points: %s", (input, code) => {
    try {
      parsePdfSplitPoints(input, 10);
      expect.fail("Expected split point validation to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(PdfSplitPointError);
      expect((error as PdfSplitPointError).code).toBe(code);
    }
  });

  it("splits a document into the requested page ranges", async () => {
    const source = await createPdf([100, 110, 120, 130, 140]);
    const parts = await splitPdfDocument(source, [
      { start: 1, end: 2 },
      { start: 3, end: 5 },
    ]);
    const documents = await Promise.all(
      parts.map((part) => PDFDocument.load(part)),
    );

    expect(documents[0].getPages().map((page) => page.getWidth())).toEqual([
      100, 110,
    ]);
    expect(documents[1].getPages().map((page) => page.getWidth())).toEqual([
      120, 130, 140,
    ]);
  });
});
