"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileType2,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatFileSize } from "@/components/tools/pdf-utils";
import type { Locale } from "@/lib/content/types";
import {
  createPdfFromWordPages,
  extractLegacyWordPages,
  getWordFormat,
  isWordFile,
  MAX_WORD_BYTES,
  MAX_WORD_PAGES,
  renderDocxPreview,
  wordBaseName,
  type WordFormat,
} from "@/lib/tools/word";

type ConversionResult = {
  url: string;
  size: number;
  pageCount: number;
};

export function WordToPdf({ locale }: { locale: Locale }) {
  const copy =
    locale === "de"
      ? {
          title: "Word-Dokument",
          intro:
            "Prüfe die Vorschau und wandle das Dokument in eine PDF-Datei um.",
          drop: "Word-Datei hier ablegen",
          choose: "Datei auswählen",
          limits: "DOC oder DOCX bis 20 MB · Verarbeitung direkt im Browser",
          loading: "Dokument wird gelesen …",
          replace: "Andere Datei",
          invalidType: "Wähle eine Word-Datei im DOC- oder DOCX-Format aus.",
          tooLarge: "Die Word-Datei darf höchstens 20 MB groß sein.",
          readError:
            "Das Dokument konnte nicht gelesen werden. Prüfe, ob es gültig und nicht passwortgeschützt ist.",
          legacyNotice:
            "Bei älteren DOC-Dateien wird der lesbare Text in ein sauberes PDF-Layout übertragen. DOCX-Dokumente behalten ihr Seitenlayout genauer.",
          preview: "Vorschau",
          legacyPreview: "Textvorschau für älteres DOC-Format",
          pages: (count: number) =>
            `${count} ${count === 1 ? "Seite" : "Seiten"}`,
          ready: "Bereit für die Konvertierung",
          convert: "PDF erstellen",
          converting: "PDF wird erstellt …",
          convertError:
            "Die PDF konnte nicht erstellt werden. Versuche es mit einem kleineren oder einfacher formatierten Dokument.",
          tooManyPages:
            "Dokumente mit mehr als 100 Seiten können nicht im Browser konvertiert werden.",
          complete: (count: number) =>
            `PDF erstellt · ${count} ${count === 1 ? "Seite" : "Seiten"}`,
          download: "PDF herunterladen",
          again: "PDF neu erstellen",
          format: (format: WordFormat) => format.toUpperCase(),
        }
      : {
          title: "Word document",
          intro: "Review the preview and convert the document into a PDF file.",
          drop: "Drop a Word file here",
          choose: "Choose file",
          limits: "DOC or DOCX up to 20 MB · processed directly in your browser",
          loading: "Reading document …",
          replace: "Choose another file",
          invalidType: "Choose a Word file in DOC or DOCX format.",
          tooLarge: "The Word file may not exceed 20 MB.",
          readError:
            "The document could not be read. Make sure it is valid and not password-protected.",
          legacyNotice:
            "For older DOC files, readable text is placed into a clean PDF layout. DOCX documents retain their page design more accurately.",
          preview: "Preview",
          legacyPreview: "Text preview for the older DOC format",
          pages: (count: number) =>
            `${count} ${count === 1 ? "page" : "pages"}`,
          ready: "Ready to convert",
          convert: "Create PDF",
          converting: "Creating PDF …",
          convertError:
            "The PDF could not be created. Try a smaller or more simply formatted document.",
          tooManyPages:
            "Documents longer than 100 pages cannot be converted in the browser.",
          complete: (count: number) =>
            `PDF created · ${count} ${count === 1 ? "page" : "pages"}`,
          download: "Download PDF",
          again: "Create PDF again",
          format: (format: WordFormat) => format.toUpperCase(),
        };
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<WordFormat | null>(null);
  const [legacyPages, setLegacyPages] = useState<string[][] | null>(null);
  const [previewPageCount, setPreviewPageCount] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const docxPreviewRef = useRef<HTMLDivElement>(null);
  const legacyPreviewRef = useRef<HTMLDivElement>(null);
  const resultUrl = useRef<string | null>(null);
  const preparationId = useRef(0);

  useEffect(
    () => () => {
      if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
    },
    [],
  );

  useEffect(() => {
    if (!file || !format) return;
    const sourceFile = file;
    const sourceFormat = format;
    const currentPreparation = ++preparationId.current;
    let cancelled = false;

    async function prepare() {
      setIsReading(true);
      setError(null);
      setLegacyPages(null);
      setPreviewPageCount(0);
      if (docxPreviewRef.current) docxPreviewRef.current.replaceChildren();

      try {
        if (sourceFormat === "docx") {
          if (!docxPreviewRef.current) throw new Error("PREVIEW_UNAVAILABLE");
          const pages = await renderDocxPreview(
            sourceFile,
            docxPreviewRef.current,
          );
          if (pages.length > MAX_WORD_PAGES) {
            throw new Error("TOO_MANY_WORD_PAGES");
          }
          if (!cancelled && currentPreparation === preparationId.current) {
            setPreviewPageCount(pages.length);
          }
        } else {
          const pages = await extractLegacyWordPages(
            await sourceFile.arrayBuffer(),
          );
          if (pages.length > MAX_WORD_PAGES) {
            throw new Error("TOO_MANY_WORD_PAGES");
          }
          if (!cancelled && currentPreparation === preparationId.current) {
            setLegacyPages(pages);
            setPreviewPageCount(pages.length);
          }
        }
      } catch (reason) {
        if (!cancelled && currentPreparation === preparationId.current) {
          if (docxPreviewRef.current) {
            docxPreviewRef.current.replaceChildren();
          }
          setFile(null);
          setFormat(null);
          setError(
            reason instanceof Error && reason.message === "TOO_MANY_WORD_PAGES"
              ? copy.tooManyPages
              : copy.readError,
          );
        }
      } finally {
        if (!cancelled && currentPreparation === preparationId.current) {
          setIsReading(false);
        }
      }
    }

    void prepare();
    return () => {
      cancelled = true;
    };
  }, [file, format, copy.readError, copy.tooManyPages]);

  function discardResult() {
    if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
    resultUrl.current = null;
    setResult(null);
  }

  function selectFile(nextFile: File) {
    const nextFormat = getWordFormat(nextFile);
    if (!isWordFile(nextFile) || !nextFormat) {
      setError(copy.invalidType);
      return;
    }
    if (nextFile.size > MAX_WORD_BYTES) {
      setError(copy.tooLarge);
      return;
    }

    discardResult();
    setError(null);
    setIsReading(true);
    setLegacyPages(null);
    setPreviewPageCount(0);
    setFile(nextFile);
    setFormat(nextFormat);
  }

  async function convertToPdf() {
    if (!file || !format || isReading || isConverting) return;
    const source =
      format === "docx"
        ? docxPreviewRef.current
        : legacyPreviewRef.current;
    const pageElements = source
      ? Array.from(
          source.querySelectorAll<HTMLElement>(
            format === "docx" ? "section.docx" : ".word-legacy-page",
          ),
        )
      : [];

    setError(null);
    setIsConverting(true);
    discardResult();
    try {
      const converted = await createPdfFromWordPages(
        pageElements,
        wordBaseName(file.name),
      );
      const url = URL.createObjectURL(converted.blob);
      resultUrl.current = url;
      setResult({
        url,
        size: converted.blob.size,
        pageCount: converted.pageCount,
      });
      void fetch("/api/tools/word-to-pdf/use", {
        method: "POST",
        keepalive: true,
      });
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message === "TOO_MANY_WORD_PAGES"
          ? copy.tooManyPages
          : copy.convertError,
      );
    } finally {
      setIsConverting(false);
    }
  }

  const busy = isReading || isConverting;
  const ready = Boolean(file && format && previewPageCount && !isReading);

  return (
    <section className="office-workspace" aria-labelledby="word-to-pdf-title">
      <header className="office-workspace__header">
        <div>
          <h2 id="word-to-pdf-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        {file && ready && (
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
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={busy}
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            if (nextFile) selectFile(nextFile);
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
            if (nextFile) selectFile(nextFile);
          }}
        >
          <span className="office-dropzone__icon office-dropzone__icon--word">
            <FileType2 aria-hidden="true" size={27} />
          </span>
          <strong>{copy.drop}</strong>
          <span>{copy.choose}</span>
          <small>{copy.limits}</small>
        </button>
      )}

      {error && (
        <p className="office-workspace__error" role="alert">
          <AlertCircle aria-hidden="true" size={17} />
          {error}
        </p>
      )}

      {file && format && (
        <>
          <div className="office-file-summary">
            <span className="office-file-summary__icon office-file-summary__icon--word">
              <FileType2 aria-hidden="true" size={21} />
            </span>
            <span>
              <strong>{file.name}</strong>
              <small>
                {formatFileSize(file.size, locale)} · {copy.format(format)}
                {previewPageCount ? ` · ${copy.pages(previewPageCount)}` : ""}
              </small>
            </span>
            {ready && <CheckCircle2 aria-label={copy.ready} size={20} />}
          </div>

          {isReading && (
            <div className="office-loading" role="status">
              <LoaderCircle
                className="office-spinner"
                aria-hidden="true"
                size={22}
              />
              <span>{copy.loading}</span>
            </div>
          )}

          <section
            className="word-preview"
            aria-labelledby="word-preview-title"
            hidden={isReading}
          >
            <header>
              <div>
                <h3 id="word-preview-title">{copy.preview}</h3>
                <p>
                  {format === "doc" && legacyPages
                    ? copy.legacyPreview
                    : previewPageCount
                      ? copy.pages(previewPageCount)
                      : copy.loading}
                </p>
              </div>
            </header>
            {format === "doc" && (
              <p className="word-preview__notice">
                <AlertCircle aria-hidden="true" size={16} />
                {copy.legacyNotice}
              </p>
            )}
            <div
              className="word-preview__viewport"
              role="region"
              aria-labelledby="word-preview-title"
              tabIndex={0}
            >
              {format === "docx" ? (
                <div className="word-docx-preview" ref={docxPreviewRef} />
              ) : (
                <div className="word-legacy-preview" ref={legacyPreviewRef}>
                  {legacyPages?.map((page, pageIndex) => (
                    <article className="word-legacy-page" key={pageIndex}>
                      {page.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {result && (
            <div className="office-workspace__result" role="status">
              <CheckCircle2 aria-hidden="true" size={20} />
              <span>
                <strong>{copy.complete(result.pageCount)}</strong>
                <small>{formatFileSize(result.size, locale)}</small>
              </span>
              <a href={result.url} download={`${wordBaseName(file.name)}.pdf`}>
                <Download aria-hidden="true" size={17} />
                {copy.download}
              </a>
            </div>
          )}

          {ready && (
            <footer className="office-workspace__footer">
              <p>{copy.pages(result?.pageCount ?? previewPageCount)}</p>
              <button
                className={result ? "action-secondary" : "action-primary"}
                type="button"
                disabled={busy}
                onClick={() => void convertToPdf()}
              >
                {isConverting ? (
                  <LoaderCircle
                    className="office-spinner"
                    aria-hidden="true"
                    size={17}
                  />
                ) : result ? (
                  <RefreshCw aria-hidden="true" size={17} />
                ) : (
                  <FileType2 aria-hidden="true" size={17} />
                )}
                {isConverting
                  ? copy.converting
                  : result
                    ? copy.again
                    : copy.convert}
              </button>
            </footer>
          )}
        </>
      )}
    </section>
  );
}
