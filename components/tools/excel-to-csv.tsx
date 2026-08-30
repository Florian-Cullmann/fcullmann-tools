"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCw,
  Table2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { formatFileSize } from "@/components/tools/pdf-utils";
import type { Locale } from "@/lib/content/types";
import {
  EXCEL_PREVIEW_COLUMNS,
  EXCEL_PREVIEW_ROWS,
  excelBaseName,
  isExcelFile,
  MAX_EXCEL_BYTES,
  parseExcelWorkbook,
  safeFilePart,
  type CsvDelimiter,
  type ParsedExcelWorkbook,
} from "@/lib/tools/excel";

export function ExcelToCsv({ locale }: { locale: Locale }) {
  const copy =
    locale === "de"
      ? {
          title: "Excel-Arbeitsmappe",
          intro: "Wähle ein Tabellenblatt aus und exportiere es als CSV-Datei.",
          drop: "Excel-Datei hier ablegen",
          choose: "Datei auswählen",
          limits: "XLSX bis 20 MB · Verarbeitung direkt im Browser",
          loading: "Arbeitsmappe wird gelesen …",
          replace: "Andere Datei",
          invalidType: "Wähle eine Excel-Datei im XLSX-Format aus.",
          tooLarge: "Die Excel-Datei darf höchstens 20 MB groß sein.",
          readError:
            "Die Arbeitsmappe konnte nicht gelesen werden. Prüfe, ob sie gültig und nicht passwortgeschützt ist.",
          dimensionError:
            "Mindestens ein Tabellenblatt ist für die Browser-Verarbeitung zu groß.",
          sheet: "Tabellenblatt",
          separator: "CSV-Trennzeichen",
          semicolon: "Semikolon",
          comma: "Komma",
          tab: "Tabulator",
          preview: "Vorschau",
          empty: "Dieses Tabellenblatt enthält keine Daten.",
          previewLimit: (rows: number, columns: number) =>
            `Vorschau der ersten ${rows} Zeilen und ${columns} Spalten`,
          dimensions: (rows: number, columns: number) =>
            `${rows.toLocaleString("de-DE")} Zeilen · ${columns.toLocaleString("de-DE")} Spalten`,
          sheets: (count: number) =>
            `${count} ${count === 1 ? "Tabellenblatt" : "Tabellenblätter"}`,
          download: "CSV herunterladen",
          ready: "Bereit für den Export",
        }
      : {
          title: "Excel workbook",
          intro: "Choose a worksheet and export it as a CSV file.",
          drop: "Drop an Excel file here",
          choose: "Choose file",
          limits: "XLSX up to 20 MB · processed directly in your browser",
          loading: "Reading workbook …",
          replace: "Choose another file",
          invalidType: "Choose an Excel file in XLSX format.",
          tooLarge: "The Excel file may not exceed 20 MB.",
          readError:
            "The workbook could not be read. Make sure it is valid and not password-protected.",
          dimensionError:
            "At least one worksheet is too large for browser processing.",
          sheet: "Worksheet",
          separator: "CSV delimiter",
          semicolon: "Semicolon",
          comma: "Comma",
          tab: "Tab",
          preview: "Preview",
          empty: "This worksheet does not contain any data.",
          previewLimit: (rows: number, columns: number) =>
            `Previewing the first ${rows} rows and ${columns} columns`,
          dimensions: (rows: number, columns: number) =>
            `${rows.toLocaleString("en-US")} rows · ${columns.toLocaleString("en-US")} columns`,
          sheets: (count: number) =>
            `${count} ${count === 1 ? "worksheet" : "worksheets"}`,
          download: "Download CSV",
          ready: "Ready to export",
        };
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<ParsedExcelWorkbook | null>(null);
  const [selectedSheetId, setSelectedSheetId] = useState<number | null>(null);
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(
    locale === "de" ? ";" : ",",
  );
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedSheet = useMemo(
    () => workbook?.sheets.find((sheet) => sheet.id === selectedSheetId) ?? null,
    [selectedSheetId, workbook],
  );

  async function readFile(nextFile: File) {
    if (!isExcelFile(nextFile)) {
      setError(copy.invalidType);
      return;
    }
    if (nextFile.size > MAX_EXCEL_BYTES) {
      setError(copy.tooLarge);
      return;
    }

    setIsReading(true);
    setError(null);
    setWorkbook(null);
    setFile(nextFile);

    try {
      const parsed = await parseExcelWorkbook(await nextFile.arrayBuffer());
      setWorkbook(parsed);
      setSelectedSheetId(parsed.sheets[0].id);
    } catch (reason) {
      setFile(null);
      setSelectedSheetId(null);
      setError(
        reason instanceof Error && reason.message === "WORKSHEET_TOO_LARGE"
          ? copy.dimensionError
          : copy.readError,
      );
    } finally {
      setIsReading(false);
    }
  }

  function downloadCsv() {
    if (!file || !workbook || !selectedSheet) return;
    const csv = workbook.toCsv(selectedSheet.id, delimiter);
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const sheetSuffix =
      workbook.sheets.length > 1 ? `-${safeFilePart(selectedSheet.name)}` : "";
    anchor.href = url;
    anchor.download = `${safeFilePart(excelBaseName(file.name))}${sheetSuffix}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    void fetch("/api/tools/excel-to-csv/use", {
      method: "POST",
      keepalive: true,
    });
  }

  const busy = isReading;

  return (
    <section className="office-workspace" aria-labelledby="excel-to-csv-title">
      <header className="office-workspace__header">
        <div>
          <h2 id="excel-to-csv-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        {file && workbook && (
          <button
            className="office-file-button"
            type="button"
            onClick={() => inputRef.current?.click()}
          >
            <RefreshCw aria-hidden="true" size={16} />
            {copy.replace}
          </button>
        )}
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          tabIndex={-1}
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          disabled={busy}
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            if (nextFile) void readFile(nextFile);
            event.target.value = "";
          }}
        />
      </header>

      {!file && !isReading && (
        <button
          className={`office-dropzone ${isDragging ? "office-dropzone--active" : ""}`}
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null))
              setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const nextFile = event.dataTransfer.files[0];
            if (nextFile) void readFile(nextFile);
          }}
        >
          <span className="office-dropzone__icon">
            <FileSpreadsheet aria-hidden="true" size={27} />
          </span>
          <strong>{copy.drop}</strong>
          <span>{copy.choose}</span>
          <small>{copy.limits}</small>
        </button>
      )}

      {isReading && (
        <div className="office-loading" role="status">
          <LoaderCircle className="office-spinner" aria-hidden="true" size={22} />
          <span>{copy.loading}</span>
        </div>
      )}

      {error && (
        <p className="office-workspace__error" role="alert">
          <AlertCircle aria-hidden="true" size={17} />
          {error}
        </p>
      )}

      {file && workbook && selectedSheet && (
        <>
          <div className="office-file-summary">
            <span className="office-file-summary__icon">
              <FileSpreadsheet aria-hidden="true" size={21} />
            </span>
            <span>
              <strong>{file.name}</strong>
              <small>
                {formatFileSize(file.size, locale)} · {copy.sheets(workbook.sheets.length)}
              </small>
            </span>
            <CheckCircle2 aria-label={copy.ready} size={20} />
          </div>

          <div className="office-options">
            <label>
              <span>{copy.sheet}</span>
              <select
                value={selectedSheetId ?? ""}
                onChange={(event) => setSelectedSheetId(Number(event.target.value))}
              >
                {workbook.sheets.map((sheet) => (
                  <option value={sheet.id} key={sheet.id}>
                    {sheet.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{copy.separator}</span>
              <select
                value={delimiter}
                onChange={(event) => setDelimiter(event.target.value as CsvDelimiter)}
              >
                <option value=";">{copy.semicolon} (;)</option>
                <option value=",">{copy.comma} (,)</option>
                <option value="\t">{copy.tab}</option>
              </select>
            </label>
          </div>

          <section className="office-preview" aria-labelledby="office-preview-title">
            <header>
              <div>
                <h3 id="office-preview-title">{copy.preview}</h3>
                <p>{copy.dimensions(selectedSheet.rowCount, selectedSheet.columnCount)}</p>
              </div>
              {(selectedSheet.rowCount > EXCEL_PREVIEW_ROWS ||
                selectedSheet.columnCount > EXCEL_PREVIEW_COLUMNS) && (
                <small>
                  {copy.previewLimit(
                    Math.min(selectedSheet.rowCount, EXCEL_PREVIEW_ROWS),
                    Math.min(selectedSheet.columnCount, EXCEL_PREVIEW_COLUMNS),
                  )}
                </small>
              )}
            </header>
            {selectedSheet.preview.length ? (
              <div className="office-preview__viewport" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th aria-label={locale === "de" ? "Zeile" : "Row"} />
                      {selectedSheet.preview[0].map((_cell, columnIndex) => (
                        <th scope="col" key={columnIndex}>
                          {String.fromCharCode(65 + columnIndex)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSheet.preview.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <th scope="row">{rowIndex + 1}</th>
                        {row.map((cell, columnIndex) => (
                          <td key={columnIndex}>{cell || "\u00A0"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="office-preview__empty">
                <Table2 aria-hidden="true" size={22} />
                <span>{copy.empty}</span>
              </div>
            )}
          </section>

          <footer className="office-workspace__footer">
            <p>{copy.dimensions(selectedSheet.rowCount, selectedSheet.columnCount)}</p>
            <button className="action-primary" type="button" onClick={downloadCsv}>
              <Download aria-hidden="true" size={17} />
              {copy.download}
            </button>
          </footer>
        </>
      )}
    </section>
  );
}
