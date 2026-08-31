import type { CsvDelimiter } from "@/lib/tools/excel";

export const MAX_CSV_BYTES = 10 * 1024 * 1024;
export const MAX_CSV_ROWS = 100_000;
export const MAX_CSV_COLUMNS = 256;
export const MAX_CSV_CELLS = 2_000_000;
export const CSV_PREVIEW_ROWS = 10;
export const CSV_PREVIEW_COLUMNS = 8;

export type ParsedCsv = {
  delimiter: CsvDelimiter;
  rows: string[][];
  rowCount: number;
  columnCount: number;
  preview: string[][];
};

const DELIMITERS: CsvDelimiter[] = [",", ";", "\t"];

function parseRows(
  source: string,
  delimiter: CsvDelimiter,
  maximumRows = Number.POSITIVE_INFINITY,
) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  function finishRow() {
    row.push(value);
    rows.push(row);
    row = [];
    value = "";
  }

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          value += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        value += character;
      }
      continue;
    }

    if (character === '"' && value.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      row.push(value);
      value = "";
    } else if (character === "\r" || character === "\n") {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      finishRow();
      if (rows.length >= maximumRows) return rows;
    } else {
      value += character;
    }
  }

  if (quoted) throw new Error("CSV_INVALID");
  finishRow();

  while (
    rows.length > 0 &&
    rows.at(-1)?.length === 1 &&
    rows.at(-1)?.[0] === ""
  ) {
    rows.pop();
  }

  return rows;
}

function detectDelimiter(source: string): CsvDelimiter {
  let best: { delimiter: CsvDelimiter; score: number } = {
    delimiter: ",",
    score: 0,
  };

  for (const delimiter of DELIMITERS) {
    const rows = parseRows(source, delimiter, 25).filter(
      (row) => row.length > 1 || row[0]?.trim(),
    );
    const frequencies = new Map<number, number>();
    for (const row of rows) {
      frequencies.set(row.length, (frequencies.get(row.length) ?? 0) + 1);
    }
    const [columns, matches] = [...frequencies.entries()].sort(
      (left, right) => right[1] - left[1] || right[0] - left[0],
    )[0] ?? [1, 0];
    const score =
      columns > 1 ? columns * 1_000 + matches * 10 - (rows.length - matches) * 100 : 0;
    if (score > best.score) best = { delimiter, score };
  }

  return best.delimiter;
}

function assertSupportedDimensions(rowCount: number, columnCount: number) {
  if (
    rowCount > MAX_CSV_ROWS ||
    columnCount > MAX_CSV_COLUMNS ||
    rowCount * columnCount > MAX_CSV_CELLS
  ) {
    throw new Error("CSV_TOO_LARGE");
  }
}

export function parseCsv(
  input: string,
  requestedDelimiter?: CsvDelimiter,
): ParsedCsv {
  const source = input.replace(/^\uFEFF/, "");
  if (!source.trim()) throw new Error("CSV_EMPTY");

  const delimiter = requestedDelimiter ?? detectDelimiter(source);
  const rows = parseRows(source, delimiter);
  const rowCount = rows.length;
  const columnCount = rows.reduce(
    (maximum, current) => Math.max(maximum, current.length),
    0,
  );
  assertSupportedDimensions(rowCount, columnCount);

  return {
    delimiter,
    rows,
    rowCount,
    columnCount,
    preview: rows.slice(0, CSV_PREVIEW_ROWS).map((row) =>
      Array.from(
        { length: Math.min(columnCount, CSV_PREVIEW_COLUMNS) },
        (_, columnIndex) => row[columnIndex] ?? "",
      ),
    ),
  };
}

export async function createExcelWorkbook(
  csv: ParsedCsv,
  options: { firstRowIsHeader: boolean; sheetName: string },
): Promise<Uint8Array<ArrayBuffer>> {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  workbook.creator = "fcullmann.com";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet(csvSheetName(options.sheetName));
  worksheet.addRows(csv.rows);

  worksheet.columns.forEach((column, columnIndex) => {
    const longestValue = csv.rows
      .slice(0, 250)
      .reduce(
        (maximum, row) => Math.max(maximum, (row[columnIndex] ?? "").length),
        0,
      );
    column.width = Math.min(40, Math.max(10, longestValue + 2));
  });

  if (options.firstRowIsHeader && csv.rowCount > 0) {
    const header = worksheet.getRow(1);
    header.font = { bold: true, color: { argb: "FF173B2B" } };
    header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE4F2EA" },
    };
    header.alignment = { vertical: "middle" };
    header.height = 22;
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    if (csv.columnCount > 0) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: csv.columnCount },
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer as unknown as ArrayBuffer);
}

export function isCsvFile(file: Pick<File, "name" | "type">) {
  return (
    /\.(csv|tsv)$/i.test(file.name) ||
    file.type === "text/csv" ||
    file.type === "text/tab-separated-values"
  );
}

export function csvBaseName(fileName: string) {
  return fileName.trim().replace(/\.(csv|tsv)$/i, "").trim() || "table";
}

export function csvSheetName(value: string) {
  return (
    value
      .replace(/[\\/?*:[\]]/g, "-")
      .replace(/^'+|'+$/g, "")
      .trim()
      .slice(0, 31)
      .trim() || "Table"
  );
}
