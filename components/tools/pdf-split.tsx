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
} from "@/lib/tools/files";
import type { Locale } from "@/lib/i18n/types";
import {
  getPdfPageCount,
  getPdfPageRanges,
  splitPdfDocument,
} from "@/lib/tools/pdf";
import { reportToolUsage } from "@/lib/tools/usage-client";

const MAX_PARTS = 100;

type SourcePdf = {
  file: File;
  pageCount: number;
};

type SplitResult = {
  parts: { url: string; bytes: Uint8Array; fileName: string }[];
  size: number;
  fileName: string;
};

function pdfFileName(value: string) {
  const name = value.trim();
  return /\.pdf$/i.test(name) ? name : `${name}.pdf`;
}

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
          downloadPart: "PDF herunterladen",
          fileName: (index: number) => `Dateiname für Teil ${index}`,
          defaultName: (start: number, end: number) =>
            `Seite ${start} - Seite ${end}.pdf`,
          invalidName:
            'Gib einen Dateinamen ohne folgende Zeichen ein: < > : " / \\ | ? *',
          duplicateName: "Vergib für jede Datei einen eigenen Namen.",
          zipping: "ZIP wird erstellt …",
          zipError: "Die ZIP-Datei konnte nicht erstellt werden. Versuche es erneut.",
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
          downloadPart: "Download PDF",
          fileName: (index: number) => `File name for part ${index}`,
          defaultName: (start: number, end: number) =>
            `Page ${start} - Page ${end}.pdf`,
          invalidName:
            'Enter a file name without these characters: < > : " / \\ | ? *',
          duplicateName: "Use a different name for each file.",
          zipping: "Creating ZIP …",
          zipError: "The ZIP file could not be created. Please try again.",
          clear: "Remove file",
        };
  const [source, setSource] = useState<SourcePdf | null>(null);
  const [splitPoints, setSplitPoints] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [result, setResult] = useState<SplitResult | null>(null);
  const resultUrls = useRef<string[]>([]);
  const zipUrl = useRef<string | null>(null);

  const fileNames = result?.parts.map((part) => pdfFileName(part.fileName)) ?? [];
  const nameErrors =
    result?.parts.map((part, index) => {
      if (
        !part.fileName.trim().replace(/\.pdf$/i, "").trim() ||
        /[<>:"/\\|?*\u0000-\u001f]/.test(part.fileName)
      ) {
        return copy.invalidName;
      }
      if (
        fileNames.some(
          (name, other) =>
            other !== index &&
            name.toLowerCase() === fileNames[index].toLowerCase(),
        )
      ) {
        return copy.duplicateName;
      }
      return null;
    }) ?? [];

  const splitPlan =
    source && splitPoints.length
      ? getPdfPageRanges(source.pageCount, splitPoints)
      : [];

  useEffect(
    () => () => {
      resultUrls.current.forEach((url) => URL.revokeObjectURL(url));
      if (zipUrl.current) URL.revokeObjectURL(zipUrl.current);
    },
    [],
  );

  function discardResult() {
    resultUrls.current.forEach((url) => URL.revokeObjectURL(url));
    resultUrls.current = [];
    if (zipUrl.current) URL.revokeObjectURL(zipUrl.current);
    zipUrl.current = null;
    setResult(null);
  }

  function clearSource() {
    discardResult();
    setSource(null);
    setSplitPoints([]);
    setError(null);
  }

  async function selectFile(incoming: FileList | File[]) {
    if (isChecking || isSplitting || isZipping) return;
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
      const parts = await splitPdfDocument(
        await source.file.arrayBuffer(),
        splitPlan,
      );
      const baseName = safeBaseName(source.file.name);
      const outputs = parts.map((bytes, index) => {
        const range = splitPlan[index];
        const url = URL.createObjectURL(
          new Blob([Uint8Array.from(bytes).buffer], { type: "application/pdf" }),
        );
        resultUrls.current.push(url);
        return { bytes, url, fileName: copy.defaultName(range.start, range.end) };
      });
      setResult({
        parts: outputs,
        size: parts.reduce((total, part) => total + part.byteLength, 0),
        fileName: `${baseName}-split.zip`,
      });
      reportToolUsage("pdf-split");
    } catch {
      discardResult();
      setError(copy.splitError);
    } finally {
      setIsSplitting(false);
    }
  }

  function renamePart(index: number, fileName: string) {
    setResult((current) =>
      current && {
        ...current,
        parts: current.parts.map((part, other) =>
          other === index ? { ...part, fileName } : part,
        ),
      },
    );
  }

  async function downloadZip() {
    if (!result || isZipping || nameErrors.some(Boolean)) return;
    setIsZipping(true);
    setError(null);
    try {
      const { default: JSZip } = await import("jszip");
      const archive = new JSZip();
      result.parts.forEach((part, index) =>
        archive.file(fileNames[index], part.bytes),
      );
      const blob = await archive.generateAsync({ type: "blob" });
      if (zipUrl.current) URL.revokeObjectURL(zipUrl.current);
      const url = URL.createObjectURL(blob);
      zipUrl.current = url;
      const link = document.createElement("a");
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError(copy.zipError);
    } finally {
      setIsZipping(false);
    }
  }

  const busy = isChecking || isSplitting || isZipping;

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
        <>
          <ul
            className="pdf-file-list pdf-split__outputs"
            aria-label={copy.preview(result.parts.length)}
          >
            {result.parts.map((part, index) => (
              <li className="pdf-file" key={part.url}>
                <span className="pdf-file__icon">
                  <FileText aria-hidden="true" size={21} />
                </span>
                <div className="pdf-file__details">
                  <label htmlFor={`pdf-split-name-${index}`}>
                    {copy.fileName(index + 1)}
                  </label>
                  <input
                    id={`pdf-split-name-${index}`}
                    type="text"
                    value={part.fileName}
                    disabled={busy}
                    spellCheck={false}
                    aria-invalid={Boolean(nameErrors[index])}
                    aria-describedby={
                      nameErrors[index] ? `pdf-split-name-error-${index}` : undefined
                    }
                    onChange={(event) => renamePart(index, event.target.value)}
                    onBlur={() => {
                      if (part.fileName.trim()) {
                        renamePart(index, pdfFileName(part.fileName));
                      }
                    }}
                  />
                  <small>{formatFileSize(part.bytes.byteLength, locale)}</small>
                  {nameErrors[index] && (
                    <small
                      className="pdf-split__name-error"
                      id={`pdf-split-name-error-${index}`}
                    >
                      {nameErrors[index]}
                    </small>
                  )}
                </div>
                <a
                  className="action-secondary pdf-split__download"
                  href={nameErrors[index] ? undefined : part.url}
                  download={fileNames[index]}
                  aria-disabled={Boolean(nameErrors[index])}
                  aria-label={`${copy.downloadPart}: ${fileNames[index]}`}
                >
                  <Download aria-hidden="true" size={17} />
                  {copy.downloadPart}
                </a>
              </li>
            ))}
          </ul>
          <div className="pdf-workspace__result">
            <CheckCircle2 aria-hidden="true" size={20} />
            <span role="status">
              <strong>{copy.ready(result.parts.length)}</strong>
              <small>{formatFileSize(result.size, locale)}</small>
            </span>
            <button
              type="button"
              onClick={downloadZip}
              disabled={busy || nameErrors.some(Boolean)}
            >
              {isZipping ? (
                <LoaderCircle
                  className="pdf-workspace__spinner"
                  aria-hidden="true"
                  size={17}
                />
              ) : (
                <Download aria-hidden="true" size={17} />
              )}
              {isZipping ? copy.zipping : copy.download}
            </button>
          </div>
        </>
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
