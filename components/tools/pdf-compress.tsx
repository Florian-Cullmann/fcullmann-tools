"use client";

import {
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  LoaderCircle,
  Minimize2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  formatFileSize,
  isPdfFile,
  MAX_PDF_BYTES,
  pdfBaseName,
} from "@/components/tools/pdf-utils";
import type { Locale } from "@/lib/content/types";
import {
  compressPdfDocument,
  type PdfCompressionLevel,
  type PdfCompressionProgress,
} from "@/lib/tools/pdf-compress";
import { getPdfPageCount } from "@/lib/tools/pdf";

type SourcePdf = {
  file: File;
  pageCount: number;
};

type CompressionResult = {
  url: string;
  fileName: string;
  size: number;
  savingsPercent: number;
  usedOriginal: boolean;
};

const compressionLevels: PdfCompressionLevel[] = [
  "small",
  "balanced",
  "high",
];

export function PdfCompress({ locale }: { locale: Locale }) {
  const copy =
    locale === "de"
      ? {
          title: "PDF-Datei",
          intro:
            "Wähle eine Komprimierungsstufe und verkleinere dein Dokument direkt im Browser.",
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
          pages: (count: number) =>
            `${count} ${count === 1 ? "Seite" : "Seiten"}`,
          settings: "Komprimierungsstufe",
          settingsIntro:
            "Wähle das Verhältnis zwischen Dateigröße und Bildqualität.",
          levels: {
            small: {
              title: "Kleine Datei",
              description: "Stärkste Komprimierung für Versand und Web",
            },
            balanced: {
              title: "Ausgewogen",
              description: "Gute Qualität bei deutlich kleinerer Datei",
            },
            high: {
              title: "Hohe Qualität",
              description: "Mehr Details für Druck und Präsentationen",
            },
          },
          flattenNote:
            "Die Seiten werden als optimierte Bilder neu aufgebaut. Textauswahl, Links und Formularfelder können dadurch entfallen.",
          compress: "PDF verkleinern",
          compressing: "PDF wird verkleinert …",
          progress: (completed: number, total: number) =>
            `Seite ${completed} von ${total}`,
          compressionError:
            "Die PDF konnte nicht verkleinert werden. Prüfe die Datei und versuche es erneut.",
          ready: (percent: number) => `${percent} % kleinere Datei`,
          alreadySmall: "Original war bereits kleiner",
          comparison: (before: string, after: string) =>
            `${before} → ${after}`,
          download: "PDF herunterladen",
          clear: "Datei entfernen",
        }
      : {
          title: "PDF file",
          intro:
            "Choose a compression level and reduce your document directly in the browser.",
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
          pages: (count: number) =>
            `${count} ${count === 1 ? "page" : "pages"}`,
          settings: "Compression level",
          settingsIntro:
            "Choose the balance between file size and image quality.",
          levels: {
            small: {
              title: "Smaller file",
              description: "Strongest compression for sharing and the web",
            },
            balanced: {
              title: "Balanced",
              description: "Good quality with a considerably smaller file",
            },
            high: {
              title: "High quality",
              description: "More detail for printing and presentations",
            },
          },
          flattenNote:
            "Pages are rebuilt as optimized images. Text selection, links, and form fields may be removed.",
          compress: "Compress PDF",
          compressing: "Compressing PDF …",
          progress: (completed: number, total: number) =>
            `Page ${completed} of ${total}`,
          compressionError:
            "The PDF could not be compressed. Check the file and try again.",
          ready: (percent: number) => `${percent}% smaller file`,
          alreadySmall: "The original was already smaller",
          comparison: (before: string, after: string) =>
            `${before} → ${after}`,
          download: "Download PDF",
          clear: "Remove file",
        };
  const [source, setSource] = useState<SourcePdf | null>(null);
  const [level, setLevel] = useState<PdfCompressionLevel>("balanced");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<PdfCompressionProgress | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const resultUrl = useRef<string | null>(null);

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
    setProgress(null);
    setError(null);
  }

  function updateLevel(nextLevel: PdfCompressionLevel) {
    discardResult();
    setError(null);
    setLevel(nextLevel);
  }

  async function selectFile(incoming: FileList | File[]) {
    if (isChecking || isCompressing) return;
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
    setProgress(null);
    setError(null);
    setIsChecking(true);

    try {
      const pageCount = await getPdfPageCount(await file.arrayBuffer());
      setSource({ file, pageCount });
    } catch {
      setError(copy.readError);
    } finally {
      setIsChecking(false);
    }
  }

  async function compressFile() {
    if (!source) return;

    discardResult();
    setError(null);
    setProgress({ completedPages: 0, totalPages: source.pageCount });
    setIsCompressing(true);

    try {
      const compressed = await compressPdfDocument(
        await source.file.arrayBuffer(),
        level,
        setProgress,
      );
      const useOriginal = compressed.byteLength >= source.file.size;
      const blob = useOriginal
        ? source.file.slice(0, source.file.size, "application/pdf")
        : new Blob([Uint8Array.from(compressed).buffer], {
            type: "application/pdf",
          });
      const url = URL.createObjectURL(blob);
      const savedBytes = Math.max(0, source.file.size - blob.size);
      resultUrl.current = url;
      setResult({
        url,
        fileName: `${pdfBaseName(source.file.name)}-compressed.pdf`,
        size: blob.size,
        savingsPercent: Math.round((savedBytes / source.file.size) * 100),
        usedOriginal: useOriginal,
      });
      void fetch("/api/tools/pdf-compress/use", {
        method: "POST",
        keepalive: true,
      });
    } catch {
      setProgress(null);
      setError(copy.compressionError);
    } finally {
      setIsCompressing(false);
    }
  }

  const busy = isChecking || isCompressing;

  return (
    <section
      className="pdf-workspace pdf-compress"
      aria-labelledby="pdf-compress-title"
    >
      <header className="pdf-workspace__header">
        <div>
          <h2 id="pdf-compress-title">{copy.title}</h2>
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
          <div className="pdf-file pdf-compress__source">
            <span className="pdf-file__icon">
              <FileText aria-hidden="true" size={21} />
            </span>
            <span className="pdf-file__details">
              <strong title={source.file.name}>{source.file.name}</strong>
              <small>
                {copy.pages(source.pageCount)} ·{" "}
                {formatFileSize(source.file.size, locale)}
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

          <section
            className="pdf-compress__settings"
            aria-labelledby="pdf-compression-settings-title"
          >
            <header>
              <h3 id="pdf-compression-settings-title">{copy.settings}</h3>
              <p>{copy.settingsIntro}</p>
            </header>
            <div
              className="pdf-compress__levels"
              role="radiogroup"
              aria-labelledby="pdf-compression-settings-title"
            >
              {compressionLevels.map((item) => (
                <label key={item}>
                  <input
                    type="radio"
                    name="pdf-compression-level"
                    value={item}
                    checked={level === item}
                    disabled={busy}
                    onChange={() => updateLevel(item)}
                  />
                  <span>
                    <strong>{copy.levels[item].title}</strong>
                    <small>{copy.levels[item].description}</small>
                  </span>
                </label>
              ))}
            </div>
            <p className="pdf-compress__note">{copy.flattenNote}</p>
          </section>
        </>
      )}

      {isCompressing && progress && (
        <div className="pdf-compress__progress" role="status">
          <span>
            <LoaderCircle
              className="pdf-workspace__spinner"
              aria-hidden="true"
              size={17}
            />
            {copy.progress(progress.completedPages, progress.totalPages)}
          </span>
          <progress
            max={progress.totalPages}
            value={progress.completedPages}
            aria-label={copy.compressing}
          />
        </div>
      )}

      {result && source && (
        <div
          className={`pdf-workspace__result ${result.usedOriginal ? "pdf-workspace__result--neutral" : ""}`}
          role="status"
        >
          <CheckCircle2 aria-hidden="true" size={20} />
          <span>
            <strong>
              {result.usedOriginal
                ? copy.alreadySmall
                : copy.ready(result.savingsPercent)}
            </strong>
            <small>
              {copy.comparison(
                formatFileSize(source.file.size, locale),
                formatFileSize(result.size, locale),
              )}
            </small>
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
            ? `${copy.pages(source.pageCount)} · ${formatFileSize(source.file.size, locale)}`
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
              disabled={busy}
              onClick={compressFile}
            >
              {isCompressing ? (
                <LoaderCircle
                  className="pdf-workspace__spinner"
                  aria-hidden="true"
                  size={17}
                />
              ) : (
                <Minimize2 aria-hidden="true" size={17} />
              )}
              {isCompressing ? copy.compressing : copy.compress}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
