import { degrees, PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import {
  addPdfPageNumbers,
  getPdfPageCount,
  getPdfPageNumberText,
  getPdfPageRanges,
  mergePdfDocuments,
  organizePdfDocument,
  rotatePdfDocument,
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

  it("creates ordered page ranges from split points", () => {
    expect(getPdfPageRanges(10, [7, 3, 7])).toEqual([
      { start: 1, end: 3 },
      { start: 4, end: 7 },
      { start: 8, end: 10 },
    ]);
  });

  it("rejects split points outside the document", () => {
    expect(() => getPdfPageRanges(10, [0])).toThrow(
      "PDF split point is outside the document.",
    );
    expect(() => getPdfPageRanges(10, [10])).toThrow(
      "PDF split point is outside the document.",
    );
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

  it("rotates every page relative to its existing orientation", async () => {
    const source = await PDFDocument.create();
    source.addPage([100, 200]);
    source.addPage([110, 200]).setRotation(degrees(90));

    const bytes = await rotatePdfDocument(await source.save(), [90, -90]);
    const rotated = await PDFDocument.load(bytes);

    expect(rotated.getPages().map((page) => page.getRotation().angle)).toEqual([
      90, 0,
    ]);
  });

  it("reorders, rotates, and removes pages", async () => {
    const source = await createPdf([100, 110, 120]);
    const bytes = await organizePdfDocument(source, [
      { sourceIndex: 2, rotation: 90 },
      { sourceIndex: 0, rotation: 0 },
    ]);
    const organized = await PDFDocument.load(bytes);

    expect(organized.getPages().map((page) => page.getWidth())).toEqual([
      120, 100,
    ]);
    expect(organized.getPages()[0].getRotation().angle).toBe(90);
  });

  it("rejects an invalid page organization", async () => {
    const source = await createPdf([100, 110]);

    await expect(
      organizePdfDocument(source, [
        { sourceIndex: 0, rotation: 0 },
        { sourceIndex: 0, rotation: 0 },
      ]),
    ).rejects.toThrow("The PDF page order is invalid.");
  });

  it("formats localized page numbers", () => {
    expect(
      getPdfPageNumberText(3, 8, {
        format: "page-total",
        pageLabel: "Seite",
        ofLabel: "von",
      }),
    ).toBe("Seite 3 von 8");
    expect(
      getPdfPageNumberText(3, 8, {
        format: "number-total",
        pageLabel: "Page",
        ofLabel: "of",
      }),
    ).toBe("3 / 8");
  });

  it("adds page numbers only to the selected page range", async () => {
    const source = await createPdf([100, 110, 120]);
    const bytes = await addPdfPageNumbers(source, {
      fromPage: 2,
      toPage: 3,
      startNumber: 5,
      fontSize: 10,
      position: "bottom-center",
      format: "page-total",
      pageLabel: "Page",
      ofLabel: "of",
    });
    const numbered = await PDFDocument.load(bytes);

    expect(numbered.getPageCount()).toBe(3);
    expect(numbered.getPage(0).node.Contents()).toBeUndefined();
    expect(numbered.getPage(1).node.Contents()).toBeDefined();
    expect(numbered.getPage(2).node.Contents()).toBeDefined();
  });
});
