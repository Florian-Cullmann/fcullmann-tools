import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { getPdfPageCount, mergePdfDocuments } from "@/lib/tools/pdf";

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
});
