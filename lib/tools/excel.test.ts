import { describe, expect, it } from "vitest";
import { Workbook } from "exceljs";
import {
  excelBaseName,
  isExcelFile,
  safeFilePart,
  serializeCsv,
  parseExcelWorkbook,
} from "@/lib/tools/excel";

describe("Excel helpers", () => {
  it("serializes delimiters, quotes, and line breaks as valid CSV", () => {
    expect(
      serializeCsv(
        [
          ["Name", "Note"],
          ["Ada, Lovelace", 'Said "hello"'],
          ["Line one\nLine two", "plain"],
        ],
        ",",
      ),
    ).toBe(
      'Name,Note\r\n"Ada, Lovelace","Said ""hello"""\r\n"Line one\nLine two",plain',
    );
  });

  it("uses the selected delimiter", () => {
    expect(serializeCsv([["1,5", "2;5"]], ";")).toBe('1,5;"2;5"');
  });

  it("recognizes XLSX files and creates safe output names", () => {
    expect(isExcelFile({ name: "Budget.XLSX", type: "" })).toBe(true);
    expect(isExcelFile({ name: "legacy.xls", type: "application/vnd.ms-excel" })).toBe(false);
    expect(excelBaseName(" Budget.xlsx ")).toBe("Budget");
    expect(safeFilePart('Q3 / Europe: "Final"')).toBe("Q3 - Europe- -Final-");
  });

  it("reads worksheets and exports the selected sheet", async () => {
    const source = new Workbook();
    const first = source.addWorksheet("Summary");
    first.addRows([
      ["Name", "Revenue"],
      ["North", 1250],
    ]);
    first.mergeCells("A3:B3");
    first.getCell("A3").value = "Total";
    source.addWorksheet("Notes").getCell("A1").value = "Ready";

    const buffer = await source.xlsx.writeBuffer();
    const parsed = await parseExcelWorkbook(
      new Uint8Array(buffer).buffer as ArrayBuffer,
    );

    expect(parsed.sheets.map((sheet) => sheet.name)).toEqual([
      "Summary",
      "Notes",
    ]);
    expect(parsed.sheets[0].preview).toEqual([
      ["Name", "Revenue"],
      ["North", "1250"],
      ["Total", ""],
    ]);
    expect(parsed.toCsv(parsed.sheets[1].id, ",")).toBe("Ready");
  });
});
