"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatFileSize,
  isPdfFile,
  MAX_PDF_BYTES,
} from "@/lib/tools/files";
import type { Locale } from "@/lib/i18n/types";
import { getPdfPageCount, mergePdfDocuments } from "@/lib/tools/pdf";
import { reportToolUsage } from "@/lib/tools/usage-client";

const MAX_FILES = 20;
const MAX_TOTAL_BYTES = MAX_PDF_BYTES * 2;

type PdfFile = {
  id: string;
  file: File;
  pageCount: number;
};

type MergeResult = {
  url: string;
  size: number;
  pageCount: number;
};

export function PdfMerge({ locale }: { locale: Locale }) {
  const copy =
    locale === "de"
      ? {
          title: "PDF-Dateien",
          intro:
            "Füge mindestens zwei Dokumente hinzu und lege ihre Reihenfolge fest.",
          drop: "PDF-Dateien hier ablegen",
          choose: "Dateien auswählen",
          limits: "Bis zu 20 PDFs und insgesamt 200 MB",
          adding: "PDFs werden geprüft …",
          addMore: "Weitere PDFs",
          clear: "Alle entfernen",
          merge: "PDFs zusammenführen",
          merging: "PDFs werden zusammengeführt …",
          minimum: "Füge mindestens zwei PDF-Dateien hinzu.",
          invalidType: "Wähle ausschließlich PDF-Dateien aus.",
          tooMany: "Du kannst höchstens 20 PDF-Dateien zusammenführen.",
          tooLarge: "Die ausgewählten Dateien dürfen zusammen maximal 200 MB groß sein.",
          readError: (name: string) =>
            `${name} konnte nicht gelesen werden. Die Datei ist möglicherweise beschädigt oder passwortgeschützt.`,
          mergeError:
            "Die PDFs konnten nicht zusammengeführt werden. Prüfe, ob alle Dateien gültig und nicht passwortgeschützt sind.",
          pages: (count: number) => `${count} ${count === 1 ? "Seite" : "Seiten"}`,
          selected: (count: number, pages: number) =>
            `${count} ${count === 1 ? "Datei" : "Dateien"} · ${pages} ${pages === 1 ? "Seite" : "Seiten"}`,
          moveUp: (name: string) => `${name} nach oben verschieben`,
          moveDown: (name: string) => `${name} nach unten verschieben`,
          remove: (name: string) => `${name} entfernen`,
          ready: (pages: number) =>
            `Fertig zusammengeführt · ${pages} ${pages === 1 ? "Seite" : "Seiten"}`,
          download: "Zusammengeführte PDF herunterladen",
        }
      : {
          title: "PDF files",
          intro: "Add at least two documents and arrange them in output order.",
          drop: "Drop PDF files here",
          choose: "Choose files",
          limits: "Up to 20 PDFs and 200 MB total",
          adding: "Checking PDFs …",
          addMore: "Add more PDFs",
          clear: "Remove all",
          merge: "Merge PDFs",
          merging: "Merging PDFs …",
          minimum: "Add at least two PDF files.",
          invalidType: "Choose PDF files only.",
          tooMany: "You can merge up to 20 PDF files at once.",
          tooLarge: "The selected files may not exceed 200 MB in total.",
          readError: (name: string) =>
            `${name} could not be read. The file may be damaged or password-protected.`,
          mergeError:
            "The PDFs could not be merged. Make sure every file is valid and not password-protected.",
          pages: (count: number) => `${count} ${count === 1 ? "page" : "pages"}`,
          selected: (count: number, pages: number) =>
            `${count} ${count === 1 ? "file" : "files"} · ${pages} ${pages === 1 ? "page" : "pages"}`,
          moveUp: (name: string) => `Move ${name} up`,
          moveDown: (name: string) => `Move ${name} down`,
          remove: (name: string) => `Remove ${name}`,
          ready: (pages: number) =>
            `Merge complete · ${pages} ${pages === 1 ? "page" : "pages"}`,
          download: "Download merged PDF",
        };
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);
  const resultUrl = useRef<string | null>(null);
  const totalPages = useMemo(
    () => files.reduce((sum, item) => sum + item.pageCount, 0),
    [files],
  );

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

  function updateFiles(update: (current: PdfFile[]) => PdfFile[]) {
    discardResult();
    setError(null);
    setFiles(update);
  }

  async function addFiles(incoming: FileList | File[]) {
    if (isAdding || isMerging) return;
    const selected = Array.from(incoming);
    if (!selected.length) return;
    if (selected.some((file) => !isPdfFile(file))) {
      setError(copy.invalidType);
      return;
    }
    if (files.length + selected.length > MAX_FILES) {
      setError(copy.tooMany);
      return;
    }
    const totalBytes = [...files.map((item) => item.file), ...selected].reduce(
      (sum, file) => sum + file.size,
      0,
    );
    if (totalBytes > MAX_TOTAL_BYTES) {
      setError(copy.tooLarge);
      return;
    }

    discardResult();
    setError(null);
    setIsAdding(true);
    let activeFile = selected[0]?.name ?? "PDF";

    try {
      const additions: PdfFile[] = [];
      for (const file of selected) {
        activeFile = file.name;
        const pageCount = await getPdfPageCount(await file.arrayBuffer());
        additions.push({ id: crypto.randomUUID(), file, pageCount });
      }
      setFiles((current) => [...current, ...additions]);
    } catch {
      setError(copy.readError(activeFile));
    } finally {
      setIsAdding(false);
    }
  }

  function moveFile(index: number, offset: -1 | 1) {
    updateFiles((current) => {
      const nextIndex = index + offset;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function mergeFiles() {
    if (files.length < 2) {
      setError(copy.minimum);
      return;
    }

    setError(null);
    setIsMerging(true);
    discardResult();

    try {
      const sources = await Promise.all(
        files.map((item) => item.file.arrayBuffer()),
      );
      const merged = await mergePdfDocuments(sources);
      const blob = new Blob([Uint8Array.from(merged).buffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      resultUrl.current = url;
      setResult({ url, size: blob.size, pageCount: totalPages });
      reportToolUsage("pdf-merge");
    } catch {
      setError(copy.mergeError);
    } finally {
      setIsMerging(false);
    }
  }

  const busy = isAdding || isMerging;

  return (
    <section className="pdf-workspace" aria-labelledby="pdf-merge-title">
      <header className="pdf-workspace__header">
        <div>
          <h2 id="pdf-merge-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        {files.length > 0 && (
          <label className="pdf-add-button" aria-disabled={busy}>
            <FilePlus2 aria-hidden="true" size={17} />
            {copy.addMore}
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              disabled={busy}
              onChange={(event) => {
                if (event.target.files) void addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        )}
      </header>

      {files.length === 0 && (
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
            void addFiles(event.dataTransfer.files);
          }}
          aria-disabled={busy}
        >
          {isAdding ? (
            <LoaderCircle className="pdf-workspace__spinner" aria-hidden="true" />
          ) : (
            <FilePlus2 aria-hidden="true" size={28} />
          )}
          <strong>{isAdding ? copy.adding : copy.drop}</strong>
          {!isAdding && <span>{copy.choose}</span>}
          <small>{copy.limits}</small>
          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple
            disabled={busy}
            onChange={(event) => {
              if (event.target.files) void addFiles(event.target.files);
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

      {files.length > 0 && (
        <ol className="pdf-file-list" aria-label={copy.title}>
          {files.map((item, index) => (
            <li className="pdf-file" key={item.id}>
              <span className="pdf-file__icon">
                <FileText aria-hidden="true" size={21} />
              </span>
              <span className="pdf-file__details">
                <strong title={item.file.name}>{item.file.name}</strong>
                <small>
                  {copy.pages(item.pageCount)} · {formatFileSize(item.file.size, locale)}
                </small>
              </span>
              <span className="pdf-file__actions">
                <button
                  type="button"
                  onClick={() => moveFile(index, -1)}
                  disabled={busy || index === 0}
                  aria-label={copy.moveUp(item.file.name)}
                  title={copy.moveUp(item.file.name)}
                >
                  <ArrowUp aria-hidden="true" size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => moveFile(index, 1)}
                  disabled={busy || index === files.length - 1}
                  aria-label={copy.moveDown(item.file.name)}
                  title={copy.moveDown(item.file.name)}
                >
                  <ArrowDown aria-hidden="true" size={17} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateFiles((current) =>
                      current.filter((file) => file.id !== item.id),
                    )
                  }
                  disabled={busy}
                  aria-label={copy.remove(item.file.name)}
                  title={copy.remove(item.file.name)}
                >
                  <Trash2 aria-hidden="true" size={17} />
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}

      {result && (
        <div className="pdf-workspace__result" role="status">
          <CheckCircle2 aria-hidden="true" size={20} />
          <span>
            <strong>{copy.ready(result.pageCount)}</strong>
            <small>{formatFileSize(result.size, locale)}</small>
          </span>
          <a href={result.url} download="merged.pdf">
            <Download aria-hidden="true" size={17} />
            {copy.download}
          </a>
        </div>
      )}

      <footer className="pdf-workspace__footer">
        <p aria-live="polite">
          {files.length > 0
            ? copy.selected(files.length, totalPages)
            : copy.minimum}
        </p>
        <div>
          {files.length > 0 && (
            <button
              className="action-secondary"
              type="button"
              disabled={busy}
              onClick={() => updateFiles(() => [])}
            >
              {copy.clear}
            </button>
          )}
          {!result && (
            <button
              className="action-primary"
              type="button"
              disabled={busy || files.length < 2}
              onClick={mergeFiles}
            >
              {isMerging ? (
                <LoaderCircle
                  className="pdf-workspace__spinner"
                  aria-hidden="true"
                  size={17}
                />
              ) : (
                <FilePlus2 aria-hidden="true" size={17} />
              )}
              {isMerging ? copy.merging : copy.merge}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
