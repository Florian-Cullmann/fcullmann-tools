"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  LoaderCircle,
  RotateCcw,
  RotateCw,
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
  getPdfPageCount,
  normalizePdfRotation,
  organizePdfDocument,
  rotatePdfDocument,
} from "@/lib/tools/pdf";
import { reportToolUsage } from "@/lib/tools/usage-client";

type EditorMode = "rotate" | "organize";

type SourcePdf = {
  file: File;
  pageCount: number;
};

type EditorPage = {
  id: string;
  sourceIndex: number;
  rotation: number;
};

type EditorResult = {
  url: string;
  size: number;
  fileName: string;
};

function createPages(pageCount: number): EditorPage[] {
  return Array.from({ length: pageCount }, (_, sourceIndex) => ({
    id: String(sourceIndex),
    sourceIndex,
    rotation: 0,
  }));
}

function getCopy(locale: Locale, mode: EditorMode) {
  const isOrganize = mode === "organize";
  return locale === "de"
    ? {
        title: "PDF-Datei",
        intro: isOrganize
          ? "Sortiere, drehe oder entferne Seiten, bevor du eine neue PDF erzeugst."
          : "Drehe einzelne Seiten oder das gesamte Dokument.",
        drop: "PDF-Datei hier ablegen",
        choose: "Datei auswählen",
        limit: "Eine PDF mit bis zu 100 MB",
        checking: "PDF wird geprüft …",
        replace: "PDF ersetzen",
        removeFile: "PDF entfernen",
        invalidType: "Wähle eine gültige PDF-Datei aus.",
        oneFile: "Wähle genau eine PDF-Datei aus.",
        tooLarge: "Die PDF-Datei darf maximal 100 MB groß sein.",
        readError:
          "Die PDF konnte nicht gelesen werden. Sie ist möglicherweise beschädigt oder passwortgeschützt.",
        pagesTitle: isOrganize ? "Seiten organisieren" : "Seiten drehen",
        pagesIntro: isOrganize
          ? "Die Nummer oben links zeigt die neue Reihenfolge."
          : "Die Vorschau zeigt die spätere Ausrichtung.",
        previewLoading: "Seitenvorschau wird geladen …",
        previewError:
          "Einige Vorschauen konnten nicht dargestellt werden. Die Bearbeitung funktioniert weiterhin.",
        viewport: isOrganize ? "PDF-Seiten organisieren" : "PDF-Seiten drehen",
        page: (page: number) => `Seite ${page}`,
        sourcePages: (count: number) =>
          `${count} ${count === 1 ? "Seite im Original" : "Seiten im Original"}`,
        outputPosition: (position: number) => `Ausgabeposition ${position}`,
        rotateLeft: (page: number) => `Seite ${page} nach links drehen`,
        rotateRight: (page: number) => `Seite ${page} nach rechts drehen`,
        moveLeft: (page: number) => `Seite ${page} nach links verschieben`,
        moveRight: (page: number) => `Seite ${page} nach rechts verschieben`,
        deletePage: (page: number) => `Seite ${page} entfernen`,
        rotateAllLeft: "Alle nach links",
        rotateAllRight: "Alle nach rechts",
        rotatedLeft: (page: number) => `Seite ${page} wurde nach links gedreht.`,
        rotatedRight: (page: number) => `Seite ${page} wurde nach rechts gedreht.`,
        rotatedAllLeft: "Alle Seiten wurden nach links gedreht.",
        rotatedAllRight: "Alle Seiten wurden nach rechts gedreht.",
        moved: (page: number, position: number) =>
          `Seite ${page} steht jetzt an Ausgabeposition ${position}.`,
        deleted: (page: number) => `Seite ${page} wurde entfernt.`,
        resetDone: "Alle Änderungen wurden zurückgesetzt.",
        reset: "Änderungen zurücksetzen",
        unchanged: isOrganize
          ? "Sortiere, drehe oder entferne mindestens eine Seite."
          : "Drehe mindestens eine Seite.",
        changed: (count: number) =>
          `${count} ${count === 1 ? "Seite" : "Seiten"} in der Ausgabe`,
        process: isOrganize ? "Neue PDF erzeugen" : "Drehung anwenden",
        processing: "PDF wird verarbeitet …",
        processError:
          "Die PDF konnte nicht verarbeitet werden. Prüfe die Datei und versuche es erneut.",
        ready: isOrganize ? "Organisierte PDF ist bereit" : "Gedrehte PDF ist bereit",
        download: "PDF herunterladen",
      }
    : {
        title: "PDF file",
        intro: isOrganize
          ? "Reorder, rotate, or remove pages before creating a new PDF."
          : "Rotate individual pages or the entire document.",
        drop: "Drop a PDF file here",
        choose: "Choose file",
        limit: "One PDF up to 100 MB",
        checking: "Checking PDF …",
        replace: "Replace PDF",
        removeFile: "Remove PDF",
        invalidType: "Choose a valid PDF file.",
        oneFile: "Choose exactly one PDF file.",
        tooLarge: "The PDF file may not exceed 100 MB.",
        readError:
          "The PDF could not be read. It may be damaged or password-protected.",
        pagesTitle: isOrganize ? "Organize pages" : "Rotate pages",
        pagesIntro: isOrganize
          ? "The number in the top-left shows the new order."
          : "The preview shows the final orientation.",
        previewLoading: "Loading page previews …",
        previewError:
          "Some previews could not be rendered. Editing still works.",
        viewport: isOrganize ? "Organize PDF pages" : "Rotate PDF pages",
        page: (page: number) => `Page ${page}`,
        sourcePages: (count: number) =>
          `${count} ${count === 1 ? "page in the original" : "pages in the original"}`,
        outputPosition: (position: number) => `Output position ${position}`,
        rotateLeft: (page: number) => `Rotate page ${page} left`,
        rotateRight: (page: number) => `Rotate page ${page} right`,
        moveLeft: (page: number) => `Move page ${page} left`,
        moveRight: (page: number) => `Move page ${page} right`,
        deletePage: (page: number) => `Remove page ${page}`,
        rotateAllLeft: "Rotate all left",
        rotateAllRight: "Rotate all right",
        rotatedLeft: (page: number) => `Page ${page} was rotated left.`,
        rotatedRight: (page: number) => `Page ${page} was rotated right.`,
        rotatedAllLeft: "All pages were rotated left.",
        rotatedAllRight: "All pages were rotated right.",
        moved: (page: number, position: number) =>
          `Page ${page} is now at output position ${position}.`,
        deleted: (page: number) => `Page ${page} was removed.`,
        resetDone: "All changes were reset.",
        reset: "Reset changes",
        unchanged: isOrganize
          ? "Reorder, rotate, or remove at least one page."
          : "Rotate at least one page.",
        changed: (count: number) =>
          `${count} ${count === 1 ? "page" : "pages"} in the output`,
        process: isOrganize ? "Create new PDF" : "Apply rotations",
        processing: "Processing PDF …",
        processError:
          "The PDF could not be processed. Check the file and try again.",
        ready: isOrganize ? "Organized PDF is ready" : "Rotated PDF is ready",
        download: "Download PDF",
      };
}

function PdfPageEditor({ locale, mode }: { locale: Locale; mode: EditorMode }) {
  const copy = getCopy(locale, mode);
  const [source, setSource] = useState<SourcePdf | null>(null);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EditorResult | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const resultUrl = useRef<string | null>(null);
  const preview = usePdfPreviewDocument(source?.file ?? null);
  const changed = Boolean(
    source &&
      (pages.length !== source.pageCount ||
        pages.some(
          (page, index) =>
            page.sourceIndex !== index || page.rotation !== 0,
        )),
  );
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

  function clearSource() {
    discardResult();
    setSource(null);
    setPages([]);
    setError(null);
    setAnnouncement("");
  }

  function updatePages(update: (current: EditorPage[]) => EditorPage[]) {
    discardResult();
    setError(null);
    setPages(update);
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
      setPages(createPages(pageCount));
      setAnnouncement("");
    } catch {
      setError(copy.readError);
    } finally {
      setIsChecking(false);
    }
  }

  function rotatePage(id: string, angle: -90 | 90) {
    const pageNumber = pages.find((page) => page.id === id)?.sourceIndex;
    updatePages((current) =>
      current.map((page) =>
        page.id === id
          ? {
              ...page,
              rotation: normalizePdfRotation(page.rotation + angle),
            }
          : page,
      ),
    );
    if (pageNumber !== undefined) {
      setAnnouncement(
        angle < 0
          ? copy.rotatedLeft(pageNumber + 1)
          : copy.rotatedRight(pageNumber + 1),
      );
    }
  }

  function rotateAll(angle: -90 | 90) {
    updatePages((current) =>
      current.map((page) => ({
        ...page,
        rotation: normalizePdfRotation(page.rotation + angle),
      })),
    );
    setAnnouncement(angle < 0 ? copy.rotatedAllLeft : copy.rotatedAllRight);
  }

  function movePage(index: number, offset: -1 | 1) {
    const pageNumber = pages[index]?.sourceIndex;
    updatePages((current) => {
      const nextIndex = index + offset;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    if (pageNumber !== undefined) {
      setAnnouncement(copy.moved(pageNumber + 1, index + offset + 1));
    }
  }

  function deletePage(page: EditorPage) {
    updatePages((current) =>
      current.filter((item) => item.id !== page.id),
    );
    setAnnouncement(copy.deleted(page.sourceIndex + 1));
  }

  function resetPages() {
    if (!source) return;
    updatePages(() => createPages(source.pageCount));
    setAnnouncement(copy.resetDone);
  }

  async function processPdf() {
    if (!source || !changed) return;

    discardResult();
    setError(null);
    setIsProcessing(true);
    try {
      const sourceData = await source.file.arrayBuffer();
      const bytes =
        mode === "rotate"
          ? await rotatePdfDocument(
              sourceData,
              pages.map((page) => page.rotation),
            )
          : await organizePdfDocument(
              sourceData,
              pages.map(({ sourceIndex, rotation }) => ({
                sourceIndex,
                rotation,
              })),
            );
      const blob = new Blob([Uint8Array.from(bytes).buffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const suffix = mode === "rotate" ? "rotated" : "organized";
      resultUrl.current = url;
      setResult({
        url,
        size: blob.size,
        fileName: `${pdfBaseName(source.file.name)}-${suffix}.pdf`,
      });
      reportToolUsage(mode === "rotate" ? "pdf-rotate" : "pdf-organize");
    } catch {
      setError(copy.processError);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section
      className={`pdf-workspace pdf-page-editor pdf-page-editor--${mode}`}
      aria-labelledby={`pdf-${mode}-title`}
    >
      <header className="pdf-workspace__header">
        <div>
          <h2 id={`pdf-${mode}-title`}>{copy.title}</h2>
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
                {copy.sourcePages(source.pageCount)} · {formatFileSize(source.file.size, locale)}
              </small>
            </span>
            <span className="pdf-file__actions">
              <button
                type="button"
                disabled={busy}
                aria-label={copy.removeFile}
                title={copy.removeFile}
                onClick={clearSource}
              >
                <Trash2 aria-hidden="true" size={17} />
              </button>
            </span>
          </div>

          <section className="pdf-editor-pages" aria-labelledby={`pdf-${mode}-pages-title`}>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {announcement}
            </p>
            <header>
              <div>
                <h3 id={`pdf-${mode}-pages-title`}>{copy.pagesTitle}</h3>
                <p>{copy.pagesIntro}</p>
              </div>
              <div className="pdf-editor-pages__bulk-actions">
                <button
                  className="action-secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => rotateAll(-90)}
                >
                  <RotateCcw aria-hidden="true" size={16} />
                  {copy.rotateAllLeft}
                </button>
                <button
                  className="action-secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => rotateAll(90)}
                >
                  <RotateCw aria-hidden="true" size={16} />
                  {copy.rotateAllRight}
                </button>
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
                {pages.map((page, index) => {
                  const sourcePage = page.sourceIndex + 1;
                  return (
                    <li className="pdf-editor-card" key={page.id}>
                      <article className="pdf-page-card">
                        {mode === "organize" && (
                          <span
                            className="pdf-page-card__part"
                            aria-label={copy.outputPosition(index + 1)}
                          >
                            {index + 1}
                          </span>
                        )}
                        <PdfPageThumbnail
                          document={preview.document}
                          pageNumber={sourcePage}
                          rotation={page.rotation}
                          unavailable={preview.error}
                        />
                        <strong>{copy.page(sourcePage)}</strong>
                      </article>
                      <div className="pdf-editor-card__actions">
                        {mode === "organize" && (
                          <button
                            type="button"
                            disabled={busy || index === 0}
                            aria-label={copy.moveLeft(sourcePage)}
                            title={copy.moveLeft(sourcePage)}
                            onClick={() => movePage(index, -1)}
                          >
                            <ArrowLeft aria-hidden="true" size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          aria-label={copy.rotateLeft(sourcePage)}
                          title={copy.rotateLeft(sourcePage)}
                          onClick={() => rotatePage(page.id, -90)}
                        >
                          <RotateCcw aria-hidden="true" size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          aria-label={copy.rotateRight(sourcePage)}
                          title={copy.rotateRight(sourcePage)}
                          onClick={() => rotatePage(page.id, 90)}
                        >
                          <RotateCw aria-hidden="true" size={16} />
                        </button>
                        {mode === "organize" && (
                          <>
                            <button
                              className="pdf-editor-card__delete"
                              type="button"
                              disabled={busy || pages.length === 1}
                              aria-label={copy.deletePage(sourcePage)}
                              title={copy.deletePage(sourcePage)}
                              onClick={() => deletePage(page)}
                            >
                              <Trash2 aria-hidden="true" size={16} />
                            </button>
                            <button
                              type="button"
                              disabled={busy || index === pages.length - 1}
                              aria-label={copy.moveRight(sourcePage)}
                              title={copy.moveRight(sourcePage)}
                              onClick={() => movePage(index, 1)}
                            >
                              <ArrowRight aria-hidden="true" size={16} />
                            </button>
                          </>
                        )}
                      </div>
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
          {source && changed ? copy.changed(pages.length) : copy.unchanged}
        </p>
        <div>
          {source && changed && (
            <button
              className="action-secondary"
              type="button"
              disabled={busy}
              onClick={resetPages}
            >
              {copy.reset}
            </button>
          )}
          {!result && (
            <button
              className="action-primary"
              type="button"
              disabled={busy || !changed}
              onClick={processPdf}
            >
              {isProcessing ? (
                <LoaderCircle className="pdf-workspace__spinner" aria-hidden="true" size={17} />
              ) : mode === "rotate" ? (
                <RotateCw aria-hidden="true" size={17} />
              ) : (
                <FilePlus2 aria-hidden="true" size={17} />
              )}
              {isProcessing ? copy.processing : copy.process}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}

export function PdfRotate({ locale }: { locale: Locale }) {
  return <PdfPageEditor locale={locale} mode="rotate" />;
}

export function PdfOrganize({ locale }: { locale: Locale }) {
  return <PdfPageEditor locale={locale} mode="organize" />;
}
