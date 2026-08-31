"use client";

import { FileText, LoaderCircle, Plus, Scissors } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import type { Locale } from "@/lib/i18n/types";

type PdfPageSelectorProps = {
  file: File;
  pageCount: number;
  splitPoints: ReadonlyArray<number>;
  disabled: boolean;
  maxParts: number;
  locale: Locale;
  onChange: (splitPoints: number[]) => void;
};

type ThumbnailStatus = "waiting" | "rendering" | "ready" | "error";

function PdfPageThumbnail({
  document,
  pageNumber,
  unavailable,
}: {
  document: PDFDocumentProxy | null;
  pageNumber: number;
  unavailable: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<ThumbnailStatus>("waiting");

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!document || !frame || !canvas) return;

    let active = true;
    let renderTask: RenderTask | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setStatus("rendering");

        void document
          .getPage(pageNumber)
          .then((page) => {
            if (!active) return null;
            const baseViewport = page.getViewport({ scale: 1 });
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            const availableWidth = Math.max(frame.clientWidth - 18, 80);
            const availableHeight = Math.max(frame.clientHeight - 18, 110);
            const scale =
              Math.min(
                availableWidth / baseViewport.width,
                availableHeight / baseViewport.height,
              ) * pixelRatio;
            const viewport = page.getViewport({ scale });

            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
            canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;
            renderTask = page.render({ canvas, viewport });

            return renderTask.promise.finally(() => page.cleanup());
          })
          .then(() => {
            if (active) setStatus("ready");
          })
          .catch((error: unknown) => {
            if (
              active &&
              (!(error instanceof Error) ||
                error.name !== "RenderingCancelledException")
            ) {
              setStatus("error");
            }
          });
      },
      {
        root: frame.closest(".pdf-page-strip__viewport"),
        rootMargin: "120px",
      },
    );

    observer.observe(frame);

    return () => {
      active = false;
      observer.disconnect();
      renderTask?.cancel();
    };
  }, [document, pageNumber]);

  return (
    <div className="pdf-page-card__preview" ref={frameRef}>
      <canvas
        ref={canvasRef}
        className={status === "ready" ? "is-ready" : undefined}
        aria-hidden="true"
      />
      {status !== "ready" && (
        <span className="pdf-page-card__placeholder" aria-hidden="true">
          {status === "error" || unavailable ? (
            <FileText size={24} />
          ) : (
            <LoaderCircle className="pdf-workspace__spinner" size={20} />
          )}
        </span>
      )}
    </div>
  );
}

export function PdfPageSelector({
  file,
  pageCount,
  splitPoints,
  disabled,
  maxParts,
  locale,
  onChange,
}: PdfPageSelectorProps) {
  const copy =
    locale === "de"
      ? {
          title: "Seiten und Trennstellen",
          intro:
            "Klicke zwischen zwei Seiten, um dort eine neue PDF beginnen zu lassen.",
          everyPage: "Jede Seite einzeln",
          clear: "Trennstellen entfernen",
          loading: "Seitenvorschau wird geladen …",
          previewError:
            "Einige Vorschauen konnten nicht dargestellt werden. Die Seitenauswahl funktioniert weiterhin.",
          viewport: "PDF-Seiten und Trennstellen",
          page: (page: number) => `Seite ${page}`,
          part: (part: number) => `Teil ${String(part).padStart(2, "0")}`,
          addSplit: (page: number) => `Nach Seite ${page} teilen`,
          removeSplit: (page: number) =>
            `Trennstelle nach Seite ${page} entfernen`,
          split: "Geteilt",
          add: "Trennen",
          limit: `Maximal ${maxParts} Ausgabedateien`,
        }
      : {
          title: "Pages and split points",
          intro:
            "Click between two pages to start a new PDF at that position.",
          everyPage: "Split every page",
          clear: "Remove split points",
          loading: "Loading page previews …",
          previewError:
            "Some previews could not be rendered. Page selection still works.",
          viewport: "PDF pages and split points",
          page: (page: number) => `Page ${page}`,
          part: (part: number) => `Part ${String(part).padStart(2, "0")}`,
          addSplit: (page: number) => `Split after page ${page}`,
          removeSplit: (page: number) =>
            `Remove split after page ${page}`,
          split: "Set",
          add: "Split",
          limit: `Up to ${maxParts} output files`,
        };
  const [previewState, setPreviewState] = useState<{
    file: File;
    document: PDFDocumentProxy | null;
    error: boolean;
  } | null>(null);
  const document = previewState?.file === file ? previewState.document : null;
  const previewError = previewState?.file === file && previewState.error;
  const allPagesSelected =
    pageCount <= maxParts && splitPoints.length === pageCount - 1;

  useEffect(() => {
    let active = true;
    let loadingTask: ReturnType<
      (typeof import("pdfjs-dist"))["getDocument"]
    > | null = null;

    void Promise.all([
      import("pdfjs-dist/webpack.mjs"),
      file.arrayBuffer(),
    ])
      .then(([pdfjs, data]) => {
        if (!active) return null;
        loadingTask = pdfjs.getDocument({ data: new Uint8Array(data) });
        return loadingTask.promise;
      })
      .then((pdf) => {
        if (!active || !pdf) return;
        setPreviewState({ file, document: pdf, error: false });
      })
      .catch(() => {
        if (active) setPreviewState({ file, document: null, error: true });
      });

    return () => {
      active = false;
      void loadingTask?.destroy();
    };
  }, [file]);

  function toggleSplit(pageNumber: number) {
    if (disabled) return;
    const isSelected = splitPoints.includes(pageNumber);
    if (!isSelected && splitPoints.length >= maxParts - 1) return;

    onChange(
      isSelected
        ? splitPoints.filter((point) => point !== pageNumber)
        : [...splitPoints, pageNumber].sort((left, right) => left - right),
    );
  }

  return (
    <section className="pdf-page-selector" aria-labelledby="pdf-pages-title">
      <header>
        <div>
          <h3 id="pdf-pages-title">{copy.title}</h3>
          <p>{copy.intro}</p>
        </div>
        <div className="pdf-page-selector__actions">
          {splitPoints.length > 0 && (
            <button
              className="action-secondary"
              type="button"
              disabled={disabled}
              onClick={() => onChange([])}
            >
              {copy.clear}
            </button>
          )}
          <button
            className="action-secondary"
            type="button"
            disabled={disabled || pageCount > maxParts || allPagesSelected}
            title={pageCount > maxParts ? copy.limit : undefined}
            onClick={() =>
              onChange(
                Array.from(
                  { length: pageCount - 1 },
                  (_, index) => index + 1,
                ),
              )
            }
          >
            {copy.everyPage}
          </button>
        </div>
      </header>

      {!document && !previewError && (
        <p className="pdf-page-selector__status" role="status">
          <LoaderCircle
            className="pdf-workspace__spinner"
            aria-hidden="true"
            size={17}
          />
          {copy.loading}
        </p>
      )}
      {previewError && (
        <p className="pdf-page-selector__status pdf-page-selector__status--error">
          <FileText aria-hidden="true" size={17} />
          {copy.previewError}
        </p>
      )}

      <div
        className="pdf-page-strip__viewport"
        tabIndex={0}
        aria-label={copy.viewport}
      >
        <ol className="pdf-page-strip">
          {Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1;
            const isPartStart =
              pageNumber === 1 || splitPoints.includes(pageNumber - 1);
            const partNumber =
              splitPoints.filter((point) => point < pageNumber).length + 1;
            const isSplit = splitPoints.includes(pageNumber);
            const canAdd = splitPoints.length < maxParts - 1;

            return (
              <li className="pdf-page-strip__item" key={pageNumber}>
                <article className="pdf-page-card">
                  {isPartStart && (
                    <span className="pdf-page-card__part">
                      {copy.part(partNumber)}
                    </span>
                  )}
                  <PdfPageThumbnail
                    document={document}
                    pageNumber={pageNumber}
                    unavailable={previewError}
                  />
                  <strong>{copy.page(pageNumber)}</strong>
                </article>
                {pageNumber < pageCount && (
                  <button
                    className={`pdf-split-marker ${isSplit ? "pdf-split-marker--active" : ""}`}
                    type="button"
                    aria-pressed={isSplit}
                    aria-label={
                      isSplit
                        ? copy.removeSplit(pageNumber)
                        : copy.addSplit(pageNumber)
                    }
                    disabled={disabled || (!isSplit && !canAdd)}
                    title={!isSplit && !canAdd ? copy.limit : undefined}
                    onClick={() => toggleSplit(pageNumber)}
                  >
                    <span className="pdf-split-marker__line" aria-hidden="true" />
                    <span className="pdf-split-marker__control" aria-hidden="true">
                      {isSplit ? <Scissors size={17} /> : <Plus size={17} />}
                    </span>
                    <span className="pdf-split-marker__label" aria-hidden="true">
                      {isSplit ? copy.split : copy.add}
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
