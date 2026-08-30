import { describe, expect, it } from "vitest";
import {
  calculatePageSlices,
  getWordFormat,
  isWordFile,
  legacyMarkdownToParagraphs,
  normalizeLegacyParagraphs,
  paginateLegacyParagraphs,
  wordBaseName,
} from "@/lib/tools/word";

describe("Word conversion helpers", () => {
  it("recognizes DOC and DOCX files", () => {
    expect(getWordFormat({ name: "Report.DOCX", type: "" })).toBe("docx");
    expect(getWordFormat({ name: "Archive.doc", type: "" })).toBe("doc");
    expect(
      getWordFormat({
        name: "upload",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    ).toBe("docx");
    expect(isWordFile({ name: "notes.txt", type: "text/plain" })).toBe(false);
  });

  it("creates safe PDF base names", () => {
    expect(wordBaseName(' Q3 / Europe: "Final".docx ')).toBe(
      "Q3 - Europe- -Final-",
    );
    expect(wordBaseName(".doc")).toBe("document");
  });

  it("normalizes and paginates extracted legacy text", () => {
    const paragraphs = normalizeLegacyParagraphs(
      "Heading\r\n\r\nFirst   paragraph\u000bSecond paragraph",
    );
    expect(paragraphs).toEqual([
      "Heading",
      "First paragraph",
      "Second paragraph",
    ]);
    expect(paginateLegacyParagraphs(paragraphs, 4, 16)).toEqual([
      ["Heading", "First paragraph"],
      ["Second paragraph"],
    ]);
  });

  it("turns legacy Word Markdown into readable preview paragraphs", () => {
    expect(
      legacyMarkdownToParagraphs(
        "# Heading\n\n- **First** item\n\n| Name | Value |\n| --- | --- |\n| Ada | 42 |",
      ),
    ).toEqual(["Heading", "• First item", "Name · Value", "Ada · 42"]);
  });

  it("calculates complete page slices without dropping a remainder", () => {
    expect(calculatePageSlices(2500, 1000)).toEqual([
      { offset: 0, height: 1000 },
      { offset: 1000, height: 1000 },
      { offset: 2000, height: 500 },
    ]);
    expect(calculatePageSlices(0, 1000)).toEqual([]);
  });
});
