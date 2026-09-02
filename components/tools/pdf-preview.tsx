"use client";

import { FileText, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import type { PdfPageNumberPosition } from "@/lib/tools/pdf";

type PreviewState = {
  file: File;
  document: PDFDocumentProxy | null;
  error: boolean;
};

export function usePdfPreviewDocument(file: File | null) {
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);

  useEffect(() => {
    if (!file) return;

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
      .then((document) => {
        if (active && document) {
          setPreviewState({ file, document, error: false });
        }
      })
      .catch(() => {
        if (active) setPreviewState({ file, document: null, error: true });
      });

    return () => {
      active = false;
      void loadingTask?.destroy();
    };
  }, [file]);

  if (!file || previewState?.file !== file) {
    return { document: null, error: false, loading: Boolean(file) };
  }

  return {
    document: previewState.document,
    error: previewState.error,
    loading: !previewState.document && !previewState.error,
  };
}

type PdfPageThumbnailProps = {
  document: PDFDocumentProxy | null;
  pageNumber: number;
  unavailable?: boolean;
  rotation?: number;
  overlay?: string;
  overlayPosition?: PdfPageNumberPosition;
};

export function PdfPageThumbnail({
  document,
  pageNumber,
  unavailable = false,
  rotation = 0,
  overlay,
  overlayPosition = "bottom-center",
}: PdfPageThumbnailProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paperSize, setPaperSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [status, setStatus] = useState<
    "waiting" | "rendering" | "ready" | "error"
  >("waiting");

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!document || !frame || !canvas) return;

    let active = true;
    let renderTask: RenderTask | null = null;
    setStatus("waiting");
    setPaperSize(null);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setStatus("rendering");

        void document
          .getPage(pageNumber)
          .then((page) => {
            if (!active) return null;
            const pageRotation = ((page.rotate + rotation) % 360 + 360) % 360;
            const baseViewport = page.getViewport({
              scale: 1,
              rotation: pageRotation,
            });
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            const availableWidth = Math.max(frame.clientWidth - 18, 80);
            const availableHeight = Math.max(frame.clientHeight - 18, 110);
            const scale =
              Math.min(
                availableWidth / baseViewport.width,
                availableHeight / baseViewport.height,
              ) * pixelRatio;
            const viewport = page.getViewport({
              scale,
              rotation: pageRotation,
            });

            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            setPaperSize({
              width: Math.floor(viewport.width / pixelRatio),
              height: Math.floor(viewport.height / pixelRatio),
            });
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
  }, [document, pageNumber, rotation]);

  return (
    <div className="pdf-page-card__preview" ref={frameRef}>
      <span
        className={`pdf-page-card__paper ${status === "ready" ? "is-ready" : ""}`}
        style={paperSize ?? undefined}
      >
        <canvas
          ref={canvasRef}
          className={status === "ready" ? "is-ready" : undefined}
          aria-hidden="true"
        />
        {overlay && (
          <span
            className={`pdf-page-card__number pdf-page-card__number--${overlayPosition}`}
            aria-hidden="true"
          >
            {overlay}
          </span>
        )}
      </span>
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
