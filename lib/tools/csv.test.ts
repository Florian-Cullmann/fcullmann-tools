import { describe, expect, it } from "vitest";
import { Workbook } from "exceljs";
import {
  createExcelWorkbook,
  csvBaseName,
  csvSheetName,
  isCsvFile,
  parseCsv,
} from "@/lib/tools/csv";

describe("CSV helpers", () => {
  it("detects delimiters and parses quoted fields and line breaks", () => {
    const parsed = parseCsv(
      'Name;Note;Amount\r\nAda;"Said ""hello""";1,5\r\nGrace;"Two\nlines";2,0',
    );

    expect(parsed.delimiter).toBe(";");
    expect(parsed.rows).toEqual([
      ["Name", "Note", "Amount"],
      ["Ada", 'Said "hello"', "1,5"],
      ["Grace", "Two\nlines", "2,0"],
    ]);
    expect(parsed.rowCount).toBe(3);
    expect(parsed.columnCount).toBe(3);
  });

  it("supports tabs, a UTF-8 BOM, and uneven rows", () => {
    const parsed = parseCsv("\uFEFFName\tValue\nOne\t1\nTwo", "\t");
    expect(parsed.rows).toEqual([
      ["Name", "Value"],
      ["One", "1"],
      ["Two"],
    ]);
    expect(parsed.preview[2]).toEqual(["Two", ""]);
  });

  it("rejects empty and malformed input", () => {
    expect(() => parseCsv(" \n ")).toThrow("CSV_EMPTY");
    expect(() => parseCsv('Name,Note\nAda,"unfinished')).toThrow("CSV_INVALID");
  });

  it("recognizes source files and creates safe names", () => {
    expect(isCsvFile({ name: "Report.CSV", type: "" })).toBe(true);
    expect(isCsvFile({ name: "data.txt", type: "text/plain" })).toBe(false);
    expect(csvBaseName(" Report.tsv ")).toBe("Report");
    expect(csvSheetName("Q3 / Europe: Final report with a long name")).toBe(
      "Q3 - Europe- Final report with",
    );
  });

  it("creates a styled workbook without coercing CSV values", async () => {
    const parsed = parseCsv("Code,Amount\n00123,42.50");
    const bytes = await createExcelWorkbook(parsed, {
      firstRowIsHeader: true,
      sheetName: "Report",
    });
    const workbook = new Workbook();
    await workbook.xlsx.load(
      bytes.buffer as Parameters<typeof workbook.xlsx.load>[0],
    );
    const sheet = workbook.getWorksheet("Report");

    expect(sheet?.getCell("A2").value).toBe("00123");
    expect(sheet?.getCell("B2").value).toBe("42.50");
    expect(sheet?.getRow(1).font.bold).toBe(true);
    expect(sheet?.views[0]).toMatchObject({ state: "frozen", ySplit: 1 });
    expect(sheet?.autoFilter).toEqual("A1:B1");
  });
});
