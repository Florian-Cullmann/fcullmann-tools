import type { Worksheet } from "exceljs";

export const MAX_EXCEL_BYTES = 20 * 1024 * 1024;
export const MAX_EXCEL_ROWS = 100_000;
export const MAX_EXCEL_COLUMNS = 256;
export const MAX_EXCEL_CELLS = 2_000_000;
export const EXCEL_PREVIEW_ROWS = 10;
export const EXCEL_PREVIEW_COLUMNS = 8;

export type CsvDelimiter = "," | ";" | "\t";

export type ExcelSheetSummary = {
  id: number;
  name: string;
  rowCount: number;
  columnCount: number;
  preview: string[][];
};

export type ParsedExcelWorkbook = {
  sheets: ExcelSheetSummary[];
  toCsv: (sheetId: number, delimiter: CsvDelimiter) => string;
};

function worksheetDimensions(worksheet: Worksheet) {
  let rowCount = 0;
  let columnCount = 0;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (!row.hasValues) return;
    rowCount = Math.max(rowCount, rowNumber);
    row.eachCell({ includeEmpty: false }, (_cell, columnNumber) => {
      columnCount = Math.max(columnCount, columnNumber);
    });
  });

  return { rowCount, columnCount };
}

function worksheetRows(
  worksheet: Worksheet,
  rowCount: number,
  columnCount: number,
) {
  return Array.from({ length: rowCount }, (_, rowIndex) =>
    Array.from(
      { length: columnCount },
      (_, columnIndex) => {
        const cell = worksheet.getRow(rowIndex + 1).getCell(columnIndex + 1);
        return cell.isMerged && cell.master.address !== cell.address
          ? ""
          : cell.text;
      },
    ),
  );
}

function assertSupportedDimensions(rowCount: number, columnCount: number) {
  if (
    rowCount > MAX_EXCEL_ROWS ||
    columnCount > MAX_EXCEL_COLUMNS ||
    rowCount * columnCount > MAX_EXCEL_CELLS
  ) {
    throw new Error("WORKSHEET_TOO_LARGE");
  }
}

export function serializeCsv(rows: ReadonlyArray<ReadonlyArray<string>>, delimiter: CsvDelimiter) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const escaped = value.replaceAll('"', '""');
          return value.includes(delimiter) || /["\r\n]/.test(value)
            ? `"${escaped}"`
            : escaped;
        })
        .join(delimiter),
    )
    .join("\r\n");
}

export async function parseExcelWorkbook(
  data: ArrayBuffer,
): Promise<ParsedExcelWorkbook> {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  await workbook.xlsx.load(
    data as Parameters<typeof workbook.xlsx.load>[0],
  );

  const dimensions = new Map<number, { rowCount: number; columnCount: number }>();
  const sheets = workbook.worksheets.map((worksheet) => {
    const size = worksheetDimensions(worksheet);
    assertSupportedDimensions(size.rowCount, size.columnCount);
    dimensions.set(worksheet.id, size);

    return {
      id: worksheet.id,
      name: worksheet.name,
      rowCount: size.rowCount,
      columnCount: size.columnCount,
      preview: worksheetRows(
        worksheet,
        Math.min(size.rowCount, EXCEL_PREVIEW_ROWS),
        Math.min(size.columnCount, EXCEL_PREVIEW_COLUMNS),
      ),
    };
  });

  if (!sheets.length) throw new Error("WORKBOOK_EMPTY");

  return {
    sheets,
    toCsv(sheetId, delimiter) {
      const worksheet = workbook.getWorksheet(sheetId);
      const size = dimensions.get(sheetId);
      if (!worksheet || !size) throw new Error("WORKSHEET_NOT_FOUND");
      return serializeCsv(
        worksheetRows(worksheet, size.rowCount, size.columnCount),
        delimiter,
      );
    },
  };
}

export function isExcelFile(file: Pick<File, "name" | "type">) {
  return (
    file.name.toLowerCase().endsWith(".xlsx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

export function excelBaseName(fileName: string) {
  return fileName.trim().replace(/\.xlsx$/i, "").trim() || "workbook";
}

export function safeFilePart(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[. ]+$/g, "") || "sheet"
  );
}
