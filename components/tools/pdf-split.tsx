"use client";

import {
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  LoaderCircle,
  Scissors,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PdfPageSelector } from "@/components/tools/pdf-page-selector";
import {
  formatFileSize,
  isPdfFile,
  MAX_PDF_BYTES,
  pdfBaseName,
} from "@/components/tools/pdf-utils";
import type { Locale } from "@/lib/content/types";
import {
  getPdfPageCount,
  getPdfPageRanges,
  splitPdfDocument,
} from "@/lib/tools/pdf";

const MAX_PARTS = 100;

type SourcePdf = {
  file: File;
  pageCount: number;
};

type SplitResult = {
  url: string;
  size: number;
  partCount: number;
  fileName: string;
};

function safeBaseName(fileName: string) {
  return pdfBaseName(fileName)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function PdfSplit({ locale }: { locale: Locale }) {
  const copy =
    locale === "de"
      ? {
          title: "PDF-Datei",
          intro: "Lege fest, nach welchen Seiten neue Dateien beginnen.",
          drop: "PDF-Datei hier ablegen",
          choose: "Datei auswählen",
          limit: "Eine PDF mit bis zu 100 MB",
          checking: "PDF wird geprüft …",
          replace: "PDF ersetzen",
          remove: "PDF entfernen",
          invalidType: "Wähle eine gültige PDF-Datei aus.",
          oneFile: "Wähle genau eine PDF-Datei aus.",
          tooLarge: "Die PDF-Datei darf maximal 100 MB groß sein.",
          tooShort: "Diese PDF besteht nur aus einer Seite und kann nicht geteilt werden.",
          readError:
            "Die PDF konnte nicht gelesen werden. Sie ist möglicherweise beschädigt oder passwortgeschützt.",
          pages: (count: number) => `${count} ${count === 1 ? "Seite" : "Seiten"}`,
          preview: (count: number) =>
            `${count} ${count === 1 ? "Ausgabedatei" : "Ausgabedateien"}`,
          chooseSplit: "Wähle mindestens eine Trennstelle zwischen den Seiten.",
          split: "PDF teilen",
          splitting: "PDF wird geteilt …",
          splitError:
            "Die PDF konnte nicht geteilt werden. Prüfe die Datei und versuche es erneut.",
          ready: (count: number) =>
            `${count} ${count === 1 ? "Datei ist" : "Dateien sind"} bereit`,
          download: "ZIP herunterladen",
          clear: "Datei entfernen",
        }
      : {
          title: "PDF file",
          intro: "Choose the pages after which a new file should begin.",
          drop: "Drop a PDF file here",
          choose: "Choose file",
          limit: "One PDF up to 100 MB",
          checking: "Checking PDF …",
          replace: "Replace PDF",
          remove: "Remove PDF",
          invalidType: "Choose a valid PDF file.",
          oneFile: "Choose exactly one PDF file.",
          tooLarge: "The PDF file may not exceed 100 MB.",
          tooShort: "This PDF has only one page and cannot be split.",
          readError:
            "The PDF could not be read. It may be damaged or password-protected.",
          pages: (count: number) => `${count} ${count === 1 ? "page" : "pages"}`,
          preview: (count: number) =>
            `${count} output ${count === 1 ? "file" : "files"}`,
          chooseSplit: "Choose at least one split point between the pages.",
          split: "Split PDF",
          splitting: "Splitting PDF …",
          splitError:
            "The PDF could not be split. Check the file and try again.",
          ready: (count: number) =>
            `${count} ${count === 1 ? "file is" : "files are"} ready`,
          download: "Download ZIP",
          clear: "Remove file",
        };
  const [source, setSource] = useState<SourcePdf | null>(null);
  const [splitPoints, setSplitPoints] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [result, setResult] = useState<SplitResult | null>(null);
  const resultUrl = useRef<string | null>(null);

  const splitPlan =
    source && splitPoints.length
      ? getPdfPageRanges(source.pageCount, splitPoints)
      : [];

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
    setSplitPoints([]);
    setError(null);
  }

  async function selectFile(incoming: FileList | File[]) {
    if (isChecking || isSplitting) return;
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
      if (pageCount < 2) {
        setError(copy.tooShort);
        return;
      }
      setSource({ file, pageCount });
      setSplitPoints([]);
    } catch {
      setError(copy.readError);
    } finally {
      setIsChecking(false);
    }
  }

  function updateSplitPoints(value: number[]) {
    discardResult();
    setError(null);
    setSplitPoints(value);
  }

  async function splitFile() {
    if (!source || splitPlan.length < 2) return;

    discardResult();
    setError(null);
    setIsSplitting(true);

    try {
      const [parts, { default: JSZip }] = await Promise.all([
        splitPdfDocument(await source.file.arrayBuffer(), splitPlan),
        import("jszip"),
      ]);
      const baseName = safeBaseName(source.file.name);
      const archive = new JSZip();

      parts.forEach((part, index) => {
        const range = splitPlan[index];
        const partNumber = String(index + 1).padStart(2, "0");
        archive.file(
          `${baseName}-part-${partNumber}-pages-${range.start}-${range.end}.pdf`,
          part,
        );
      });

      const bytes = await archive.generateAsync({ type: "uint8array" });
      const blob = new Blob([Uint8Array.from(bytes).buffer], {
        type: "application/zip",
      });
      const url = URL.createObjectURL(blob);
      resultUrl.current = url;
      setResult({
        url,
        size: blob.size,
        partCount: parts.length,
        fileName: `${baseName}-split.zip`,
      });
      void fetch("/api/tools/pdf-split/use", {
        method: "POST",
        keepalive: true,
      });
    } catch {
      setError(copy.splitError);
    } finally {
      setIsSplitting(false);
    }
  }

  const busy = isChecking || isSplitting;

  return (
    <section className="pdf-workspace pdf-split" aria-labelledby="pdf-split-title">
      <header className="pdf-workspace__header">
        <div>
          <h2 id="pdf-split-title">{copy.title}</h2>
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
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setIsDragging(false);
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
          <div className="pdf-file pdf-split__source">
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
                onClick={clearSource}
                disabled={busy}
                aria-label={copy.remove}
                title={copy.remove}
              >
                <Trash2 aria-hidden="true" size={17} />
              </button>
            </span>
          </div>

          <PdfPageSelector
            file={source.file}
            pageCount={source.pageCount}
            splitPoints={splitPoints}
            disabled={busy}
            maxParts={MAX_PARTS}
            locale={locale}
            onChange={updateSplitPoints}
          />
        </>
      )}

      {result && (
        <div className="pdf-workspace__result" role="status">
          <CheckCircle2 aria-hidden="true" size={20} />
          <span>
            <strong>{copy.ready(result.partCount)}</strong>
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
          {source
            ? splitPlan.length >= 2
              ? copy.preview(splitPlan.length)
              : copy.chooseSplit
            : copy.limit}
        </p>
        <div>
          {source && (
            <button
              className="action-secondary"
              type="button"
              disabled={busy}
              onClick={clearSource}
            >
              {copy.clear}
            </button>
          )}
          {source && !result && (
            <button
              className="action-primary"
              type="button"
              disabled={busy || splitPlan.length < 2}
              onClick={splitFile}
            >
              {isSplitting ? (
                <LoaderCircle
                  className="pdf-workspace__spinner"
                  aria-hidden="true"
                  size={17}
                />
              ) : (
                <Scissors aria-hidden="true" size={17} />
              )}
              {isSplitting ? copy.splitting : copy.split}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
