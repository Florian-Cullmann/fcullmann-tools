"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useRef, useState } from "react";
import { formatFileSize } from "@/components/tools/pdf-utils";
import type { Locale } from "@/lib/content/types";
import {
  createExcelWorkbook,
  CSV_PREVIEW_COLUMNS,
  CSV_PREVIEW_ROWS,
  csvBaseName,
  isCsvFile,
  MAX_CSV_BYTES,
  parseCsv,
  type ParsedCsv,
} from "@/lib/tools/csv";
import type { CsvDelimiter } from "@/lib/tools/excel";

export function CsvToExcel({ locale }: { locale: Locale }) {
  const copy =
    locale === "de"
      ? {
          title: "CSV-Tabelle",
          intro: "Prüfe die Spalten und speichere die Tabelle als Excel-Datei.",
          drop: "CSV- oder TSV-Datei hier ablegen",
          choose: "Datei auswählen",
          limits: "CSV oder TSV bis 10 MB · Verarbeitung direkt im Browser",
          loading: "Tabelle wird gelesen …",
          replace: "Andere Datei",
          invalidType: "Wähle eine CSV- oder TSV-Datei aus.",
          tooLarge: "Die Datei darf höchstens 10 MB groß sein.",
          encodingError: "Die Datei muss als UTF-8 gespeichert sein.",
          emptyError:
            "Die Datei ist leer. Wähle eine CSV- oder TSV-Datei mit Daten aus.",
          parseError:
            "Die Tabelle konnte nicht gelesen werden. Prüfe Trennzeichen und Anführungszeichen.",
          dimensionError:
            "Die Tabelle ist für die Browser-Verarbeitung zu groß.",
          separator: "Trennzeichen",
          semicolon: "Semikolon",
          comma: "Komma",
          tab: "Tabulator",
          firstRow: "Erste Zeile",
          headings: "Als Spaltenüberschriften verwenden",
          data: "Als normale Daten behalten",
          preview: "Vorschau",
          previewLimit: (rows: number, columns: number) =>
            `Vorschau der ersten ${rows} Zeilen und ${columns} Spalten`,
          dimensions: (rows: number, columns: number) =>
            `${rows.toLocaleString("de-DE")} Zeilen · ${columns.toLocaleString("de-DE")} Spalten`,
          ready: "Bereit für die Konvertierung",
          download: "Excel herunterladen",
          converting: "Excel wird erstellt …",
        }
      : {
          title: "CSV table",
          intro: "Review the columns and save the table as an Excel workbook.",
          drop: "Drop a CSV or TSV file here",
          choose: "Choose file",
          limits: "CSV or TSV up to 10 MB · processed directly in your browser",
          loading: "Reading table …",
          replace: "Choose another file",
          invalidType: "Choose a CSV or TSV file.",
          tooLarge: "The file may not exceed 10 MB.",
          encodingError: "The file must be saved as UTF-8.",
          emptyError:
            "The file is empty. Choose a CSV or TSV file that contains data.",
          parseError:
            "The table could not be read. Check its delimiter and quotation marks.",
          dimensionError: "The table is too large for browser processing.",
          separator: "Delimiter",
          semicolon: "Semicolon",
          comma: "Comma",
          tab: "Tab",
          firstRow: "First row",
          headings: "Use as column headings",
          data: "Keep as regular data",
          preview: "Preview",
          previewLimit: (rows: number, columns: number) =>
            `Previewing the first ${rows} rows and ${columns} columns`,
          dimensions: (rows: number, columns: number) =>
            `${rows.toLocaleString("en-US")} rows · ${columns.toLocaleString("en-US")} columns`,
          ready: "Ready to convert",
          download: "Download Excel",
          converting: "Creating Excel …",
        };
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState("");
  const [table, setTable] = useState<ParsedCsv | null>(null);
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(",");
  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function parseError(reason: unknown) {
    if (reason instanceof Error && reason.message === "CSV_EMPTY") {
      return copy.emptyError;
    }
    if (reason instanceof Error && reason.message === "CSV_TOO_LARGE") {
      return copy.dimensionError;
    }
    return copy.parseError;
  }

  async function readFile(nextFile: File) {
    if (!isCsvFile(nextFile)) {
      setError(copy.invalidType);
      return;
    }
    if (nextFile.size > MAX_CSV_BYTES) {
      setError(copy.tooLarge);
      return;
    }

    setIsReading(true);
    setError(null);
    setFile(nextFile);
    setTable(null);

    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(
        await nextFile.arrayBuffer(),
      );
      const parsed = parseCsv(text);
      setSource(text);
      setDelimiter(parsed.delimiter);
      setTable(parsed);
    } catch (reason) {
      setFile(null);
      setSource("");
      setError(
        reason instanceof TypeError ? copy.encodingError : parseError(reason),
      );
    } finally {
      setIsReading(false);
    }
  }

  function changeDelimiter(nextDelimiter: CsvDelimiter) {
    try {
      const parsed = parseCsv(source, nextDelimiter);
      setDelimiter(nextDelimiter);
      setTable(parsed);
      setError(null);
    } catch (reason) {
      setError(parseError(reason));
    }
  }

  async function downloadExcel() {
    if (!file || !table || isConverting) return;
    setIsConverting(true);
    setError(null);
    try {
      const baseName = csvBaseName(file.name);
      const bytes = await createExcelWorkbook(table, {
        firstRowIsHeader,
        sheetName: baseName,
      });
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${baseName}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
      void fetch("/api/tools/csv-to-excel/use", {
        method: "POST",
        keepalive: true,
      });
    } catch (reason) {
      setError(parseError(reason));
    } finally {
      setIsConverting(false);
    }
  }

  const busy = isReading || isConverting;

  return (
    <section className="office-workspace" aria-labelledby="csv-to-excel-title">
      <header className="office-workspace__header">
        <div>
          <h2 id="csv-to-excel-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        {file && table && (
          <button
            className="office-file-button"
            type="button"
            disabled={busy}
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
          accept=".csv,.tsv,text/csv,text/tab-separated-values"
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

      {file && table && (
        <>
          <div className="office-file-summary">
            <span className="office-file-summary__icon">
              <FileSpreadsheet aria-hidden="true" size={21} />
            </span>
            <span>
              <strong>{file.name}</strong>
              <small>
                {formatFileSize(file.size, locale)} · {copy.dimensions(table.rowCount, table.columnCount)}
              </small>
            </span>
            <CheckCircle2 aria-label={copy.ready} size={20} />
          </div>

          <div className="office-options">
            <label>
              <span>{copy.separator}</span>
              <select
                value={delimiter}
                onChange={(event) => changeDelimiter(event.target.value as CsvDelimiter)}
              >
                <option value=";">{copy.semicolon} (;)</option>
                <option value=",">{copy.comma} (,)</option>
                <option value="\t">{copy.tab}</option>
              </select>
            </label>
            <label>
              <span>{copy.firstRow}</span>
              <select
                value={firstRowIsHeader ? "headings" : "data"}
                onChange={(event) => setFirstRowIsHeader(event.target.value === "headings")}
              >
                <option value="headings">{copy.headings}</option>
                <option value="data">{copy.data}</option>
              </select>
            </label>
          </div>

          <section
            className={`office-preview ${firstRowIsHeader ? "office-preview--header-row" : ""}`}
            aria-labelledby="csv-preview-title"
          >
            <header>
              <div>
                <h3 id="csv-preview-title">{copy.preview}</h3>
                <p>{copy.dimensions(table.rowCount, table.columnCount)}</p>
              </div>
              {(table.rowCount > CSV_PREVIEW_ROWS ||
                table.columnCount > CSV_PREVIEW_COLUMNS) && (
                <small>
                  {copy.previewLimit(
                    Math.min(table.rowCount, CSV_PREVIEW_ROWS),
                    Math.min(table.columnCount, CSV_PREVIEW_COLUMNS),
                  )}
                </small>
              )}
            </header>
            <div className="office-preview__viewport" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th aria-label={locale === "de" ? "Zeile" : "Row"} />
                    {table.preview[0].map((_cell, columnIndex) => (
                      <th scope="col" key={columnIndex}>
                        {String.fromCharCode(65 + columnIndex)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.preview.map((row, rowIndex) => (
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
          </section>

          <footer className="office-workspace__footer">
            <p>{copy.dimensions(table.rowCount, table.columnCount)}</p>
            <button
              className="action-primary"
              type="button"
              disabled={isConverting}
              onClick={() => void downloadExcel()}
            >
              {isConverting ? (
                <LoaderCircle className="office-spinner" aria-hidden="true" size={17} />
              ) : (
                <Download aria-hidden="true" size={17} />
              )}
              {isConverting ? copy.converting : copy.download}
            </button>
          </footer>
        </>
      )}
    </section>
  );
}
