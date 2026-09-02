"use client";

import {
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  Hash,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PdfPageThumbnail, usePdfPreviewDocument } from "@/components/tools/pdf-preview";
import type { Locale } from "@/lib/i18n/types";
import {
  formatFileSize,
  isPdfFile,
  MAX_PDF_BYTES,
  pdfBaseName,
} from "@/lib/tools/files";
import {
  addPdfPageNumbers,
  getPdfPageCount,
  getPdfPageNumberText,
  type PdfPageNumberFormat,
  type PdfPageNumberOptions,
  type PdfPageNumberPosition,
} from "@/lib/tools/pdf";
import { reportToolUsage } from "@/lib/tools/usage-client";

type SourcePdf = {
  file: File;
  pageCount: number;
};

type PageNumberResult = {
  url: string;
  size: number;
  fileName: string;
};

type EditableOptions = Omit<PdfPageNumberOptions, "pageLabel" | "ofLabel">;

const initialOptions: EditableOptions = {
  fromPage: 1,
  toPage: 1,
  startNumber: 1,
  fontSize: 10,
  position: "bottom-center",
  format: "number",
};

export function PdfPageNumbers({ locale }: { locale: Locale }) {
  const copy =
    locale === "de"
      ? {
          title: "PDF-Datei",
          intro: "Füge gut lesbare Seitenzahlen an der gewünschten Position ein.",
          drop: "PDF-Datei hier ablegen",
          choose: "Datei auswählen",
          limit: "Eine PDF mit bis zu 100 MB",
          checking: "PDF wird geprüft …",
          replace: "PDF ersetzen",
          remove: "PDF entfernen",
          invalidType: "Wähle eine gültige PDF-Datei aus.",
          oneFile: "Wähle genau eine PDF-Datei aus.",
          tooLarge: "Die PDF-Datei darf maximal 100 MB groß sein.",
          readError:
            "Die PDF konnte nicht gelesen werden. Sie ist möglicherweise beschädigt oder passwortgeschützt.",
          settings: "Nummerierung",
          settingsIntro: "Lege Format, Position und Seitenbereich fest.",
          position: "Position",
          positions: {
            "top-left": "Oben links",
            "top-center": "Oben mittig",
            "top-right": "Oben rechts",
            "bottom-left": "Unten links",
            "bottom-center": "Unten mittig",
            "bottom-right": "Unten rechts",
          },
          format: "Format",
          formats: {
            number: "1",
            "number-total": "1 / 12",
            "page-total": "Seite 1 von 12",
          },
          fontSize: "Schriftgröße",
          firstNumber: "Erste Nummer",
          fromPage: "Ab PDF-Seite",
          toPage: "Bis PDF-Seite",
          preview: "Vorschau",
          previewIntro: "Die Markierung zeigt die gewählte Platzierung.",
          previewLoading: "Seitenvorschau wird geladen …",
          previewError:
            "Einige Vorschauen konnten nicht dargestellt werden. Die Nummerierung funktioniert weiterhin.",
          viewport: "Vorschau der Seitennummerierung",
          page: (page: number) => `Seite ${page}`,
          pages: (count: number) => `${count} ${count === 1 ? "Seite" : "Seiten"}`,
          range: (from: number, to: number) =>
            `PDF-Seiten ${from}–${to} werden nummeriert.`,
          process: "Seitenzahlen einfügen",
          processing: "Seitenzahlen werden eingefügt …",
          processError:
            "Die Seitenzahlen konnten nicht eingefügt werden. Prüfe die Einstellungen und versuche es erneut.",
          ready: "PDF mit Seitenzahlen ist bereit",
          download: "PDF herunterladen",
          pageLabel: "Seite",
          ofLabel: "von",
        }
      : {
          title: "PDF file",
          intro: "Add clear page numbers in the position you choose.",
          drop: "Drop a PDF file here",
          choose: "Choose file",
          limit: "One PDF up to 100 MB",
          checking: "Checking PDF …",
          replace: "Replace PDF",
          remove: "Remove PDF",
          invalidType: "Choose a valid PDF file.",
          oneFile: "Choose exactly one PDF file.",
          tooLarge: "The PDF file may not exceed 100 MB.",
          readError:
            "The PDF could not be read. It may be damaged or password-protected.",
          settings: "Numbering",
          settingsIntro: "Choose the format, position, and page range.",
          position: "Position",
          positions: {
            "top-left": "Top left",
            "top-center": "Top center",
            "top-right": "Top right",
            "bottom-left": "Bottom left",
            "bottom-center": "Bottom center",
            "bottom-right": "Bottom right",
          },
          format: "Format",
          formats: {
            number: "1",
            "number-total": "1 / 12",
            "page-total": "Page 1 of 12",
          },
          fontSize: "Font size",
          firstNumber: "First number",
          fromPage: "From PDF page",
          toPage: "To PDF page",
          preview: "Preview",
          previewIntro: "The marker shows the selected placement.",
          previewLoading: "Loading page previews …",
          previewError:
            "Some previews could not be rendered. Numbering still works.",
          viewport: "Page number preview",
          page: (page: number) => `Page ${page}`,
          pages: (count: number) => `${count} ${count === 1 ? "page" : "pages"}`,
          range: (from: number, to: number) =>
            `PDF pages ${from}–${to} will be numbered.`,
          process: "Add page numbers",
          processing: "Adding page numbers …",
          processError:
            "Page numbers could not be added. Check the settings and try again.",
          ready: "PDF with page numbers is ready",
          download: "Download PDF",
          pageLabel: "Page",
          ofLabel: "of",
        };
  const [source, setSource] = useState<SourcePdf | null>(null);
  const [options, setOptions] = useState<EditableOptions>(initialOptions);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PageNumberResult | null>(null);
  const resultUrl = useRef<string | null>(null);
  const preview = usePdfPreviewDocument(source?.file ?? null);
  const busy = isChecking || isProcessing;

  useEffect(
    () => () => {
      if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
    },
    [],
  );

  function discardResult() {
    if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
    resultUrl.current = null;
    setResult(null);
  }

  function updateOptions(update: Partial<EditableOptions>) {
    discardResult();
    setError(null);
    setOptions((current) => ({ ...current, ...update }));
  }

  function clearSource() {
    discardResult();
    setSource(null);
    setOptions(initialOptions);
    setError(null);
  }

  async function selectFile(incoming: FileList | File[]) {
    if (busy) return;
    const selected = Array.from(incoming);
    if (!selected.length) return;
    if (selected.length !== 1) {
      setError(copy.oneFile);
      return;
    }

    const file = selected[0];
    if (!isPdfFile(file)) {
      setError(copy.invalidType);
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError(copy.tooLarge);
      return;
    }

    discardResult();
    setError(null);
    setIsChecking(true);
    try {
      const pageCount = await getPdfPageCount(await file.arrayBuffer());
      setSource({ file, pageCount });
      setOptions({ ...initialOptions, toPage: pageCount });
    } catch {
      setError(copy.readError);
    } finally {
      setIsChecking(false);
    }
  }

  function getPreviewLabel(pageNumber: number) {
    if (pageNumber < options.fromPage || pageNumber > options.toPage) {
      return undefined;
    }
    const number = options.startNumber + pageNumber - options.fromPage;
    const total = options.startNumber + options.toPage - options.fromPage;
    return getPdfPageNumberText(number, total, {
      format: options.format,
      pageLabel: copy.pageLabel,
      ofLabel: copy.ofLabel,
    });
  }

  async function processPdf() {
    if (!source) return;

    discardResult();
    setError(null);
    setIsProcessing(true);
    try {
      const bytes = await addPdfPageNumbers(await source.file.arrayBuffer(), {
        ...options,
        pageLabel: copy.pageLabel,
        ofLabel: copy.ofLabel,
      });
      const blob = new Blob([Uint8Array.from(bytes).buffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      resultUrl.current = url;
      setResult({
        url,
        size: blob.size,
        fileName: `${pdfBaseName(source.file.name)}-numbered.pdf`,
      });
      reportToolUsage("pdf-page-numbers");
    } catch {
      setError(copy.processError);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="pdf-workspace pdf-page-numbers" aria-labelledby="pdf-page-numbers-title">
      <header className="pdf-workspace__header">
        <div>
          <h2 id="pdf-page-numbers-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        {source && (
          <label className="pdf-add-button" aria-disabled={busy}>
            <FilePlus2 aria-hidden="true" size={17} />
            {copy.replace}
            <input
              type="file"
              accept="application/pdf,.pdf"
              disabled={busy}
              onChange={(event) => {
                if (event.target.files) void selectFile(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        )}
      </header>

      {!source && (
        <label
          className={`pdf-dropzone ${isDragging ? "pdf-dropzone--active" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!busy) setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void selectFile(event.dataTransfer.files);
          }}
          aria-disabled={busy}
        >
          {isChecking ? (
            <LoaderCircle className="pdf-workspace__spinner" aria-hidden="true" />
          ) : (
            <FilePlus2 aria-hidden="true" size={28} />
          )}
          <strong>{isChecking ? copy.checking : copy.drop}</strong>
          {!isChecking && <span>{copy.choose}</span>}
          <small>{copy.limit}</small>
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={busy}
            onChange={(event) => {
              if (event.target.files) void selectFile(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      )}

      {error && (
        <p className="pdf-workspace__error" role="alert">
          <X aria-hidden="true" size={17} />
          {error}
        </p>
      )}

      {source && (
        <>
          <div className="pdf-file pdf-page-editor__source">
            <span className="pdf-file__icon">
              <FileText aria-hidden="true" size={21} />
            </span>
            <span className="pdf-file__details">
              <strong title={source.file.name}>{source.file.name}</strong>
              <small>
                {copy.pages(source.pageCount)} · {formatFileSize(source.file.size, locale)}
              </small>
            </span>
            <span className="pdf-file__actions">
              <button
                type="button"
                disabled={busy}
                aria-label={copy.remove}
                title={copy.remove}
                onClick={clearSource}
              >
                <Trash2 aria-hidden="true" size={17} />
              </button>
            </span>
          </div>

          <section className="pdf-number-settings" aria-labelledby="pdf-number-settings-title">
            <header>
              <h3 id="pdf-number-settings-title">{copy.settings}</h3>
              <p>{copy.settingsIntro}</p>
            </header>
            <div className="pdf-number-settings__fields">
              <label>
                <span>{copy.position}</span>
                <select
                  value={options.position}
                  disabled={busy}
                  onChange={(event) =>
                    updateOptions({ position: event.target.value as PdfPageNumberPosition })
                  }
                >
                  {Object.entries(copy.positions).map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>{copy.format}</span>
                <select
                  value={options.format}
                  disabled={busy}
                  onChange={(event) =>
                    updateOptions({ format: event.target.value as PdfPageNumberFormat })
                  }
                >
                  {Object.entries(copy.formats).map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>{copy.fontSize}</span>
                <select
                  value={options.fontSize}
                  disabled={busy}
                  onChange={(event) => updateOptions({ fontSize: Number(event.target.value) })}
                >
                  <option value={8}>8 pt</option>
                  <option value={10}>10 pt</option>
                  <option value={12}>12 pt</option>
                  <option value={14}>14 pt</option>
                  <option value={18}>18 pt</option>
                </select>
              </label>
              <label>
                <span>{copy.firstNumber}</span>
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={options.startNumber}
                  disabled={busy}
                  onChange={(event) =>
                    updateOptions({ startNumber: Math.max(0, Number(event.target.value)) })
                  }
                />
              </label>
              <label>
                <span>{copy.fromPage}</span>
                <input
                  type="number"
                  min={1}
                  max={options.toPage}
                  value={options.fromPage}
                  disabled={busy}
                  onChange={(event) =>
                    updateOptions({
                      fromPage: Math.min(options.toPage, Math.max(1, Number(event.target.value))),
                    })
                  }
                />
              </label>
              <label>
                <span>{copy.toPage}</span>
                <input
                  type="number"
                  min={options.fromPage}
                  max={source.pageCount}
                  value={options.toPage}
                  disabled={busy}
                  onChange={(event) =>
                    updateOptions({
                      toPage: Math.min(
                        source.pageCount,
                        Math.max(options.fromPage, Number(event.target.value)),
                      ),
                    })
                  }
                />
              </label>
            </div>
          </section>

          <section className="pdf-editor-pages" aria-labelledby="pdf-number-preview-title">
            <header>
              <div>
                <h3 id="pdf-number-preview-title">{copy.preview}</h3>
                <p>{copy.previewIntro}</p>
              </div>
            </header>
            {preview.loading && (
              <p className="pdf-page-selector__status" role="status">
                <LoaderCircle className="pdf-workspace__spinner" aria-hidden="true" size={17} />
                {copy.previewLoading}
              </p>
            )}
            {preview.error && (
              <p className="pdf-page-selector__status pdf-page-selector__status--error">
                <FileText aria-hidden="true" size={17} />
                {copy.previewError}
              </p>
            )}
            <div className="pdf-page-strip__viewport" tabIndex={0} aria-label={copy.viewport}>
              <ol className="pdf-editor-strip">
                {Array.from({ length: source.pageCount }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <li className="pdf-editor-card" key={pageNumber}>
                      <article className="pdf-page-card">
                        <PdfPageThumbnail
                          document={preview.document}
                          pageNumber={pageNumber}
                          unavailable={preview.error}
                          overlay={getPreviewLabel(pageNumber)}
                          overlayPosition={options.position}
                        />
                        <strong>{copy.page(pageNumber)}</strong>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        </>
      )}

      {result && (
        <div className="pdf-workspace__result" role="status">
          <CheckCircle2 aria-hidden="true" size={20} />
          <span>
            <strong>{copy.ready}</strong>
            <small>{formatFileSize(result.size, locale)}</small>
          </span>
          <a href={result.url} download={result.fileName}>
            <Download aria-hidden="true" size={17} />
            {copy.download}
          </a>
        </div>
      )}

      <footer className="pdf-workspace__footer">
        <p aria-live="polite">
          {source ? copy.range(options.fromPage, options.toPage) : copy.limit}
        </p>
        <div>
          {!result && (
            <button
              className="action-primary"
              type="button"
              disabled={busy || !source}
              onClick={processPdf}
            >
              {isProcessing ? (
                <LoaderCircle className="pdf-workspace__spinner" aria-hidden="true" size={17} />
              ) : (
                <Hash aria-hidden="true" size={17} />
              )}
              {isProcessing ? copy.processing : copy.process}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
