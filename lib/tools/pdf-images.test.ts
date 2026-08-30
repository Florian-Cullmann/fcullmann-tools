import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import {
  createPdfFromJpgs,
  getPdfImageLayout,
  getPdfPageRenderScale,
} from "@/lib/tools/pdf-images";

const wideJpg = Uint8Array.from(
  Buffer.from(
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAACAAMDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDra/Jz+iz/2Q==",
    "base64",
  ),
);

describe("PDF and JPG conversion helpers", () => {
  it("uses the image orientation for automatic A4 pages", () => {
    const layout = getPdfImageLayout(
      { width: 1600, height: 900 },
      { pageSize: "a4", orientation: "auto", margin: "standard" },
    );

    expect(layout.pageWidth).toBeGreaterThan(layout.pageHeight);
    expect(layout.x).toBeCloseTo(36);
    expect(layout.imageWidth).toBeCloseTo(layout.pageWidth - 72);
    expect(layout.y).toBeGreaterThan(36);
  });

  it("honors an explicit portrait orientation and keeps the image contained", () => {
    const layout = getPdfImageLayout(
      { width: 1600, height: 900 },
      { pageSize: "letter", orientation: "portrait", margin: "small" },
    );

    expect(layout.pageHeight).toBeGreaterThan(layout.pageWidth);
    expect(layout.x).toBeCloseTo(18);
    expect(layout.y).toBeGreaterThanOrEqual(18);
    expect(layout.imageWidth).toBeLessThanOrEqual(layout.pageWidth - 36);
    expect(layout.imageHeight).toBeLessThanOrEqual(layout.pageHeight - 36);
  });

  it("creates one PDF page per JPG in the supplied order", async () => {
    const bytes = await createPdfFromJpgs([wideJpg, wideJpg], {
      pageSize: "a4",
      orientation: "auto",
      margin: "none",
    });
    const document = await PDFDocument.load(bytes);

    expect(document.getPageCount()).toBe(2);
    expect(document.getPages()[0].getWidth()).toBeGreaterThan(
      document.getPages()[0].getHeight(),
    );
  });

  it("caps oversized page renders while preserving smaller requested scales", () => {
    expect(getPdfPageRenderScale(612, 792, 144)).toBe(2);
    expect(getPdfPageRenderScale(4000, 8000, 300)).toBe(0.75);
  });
});
