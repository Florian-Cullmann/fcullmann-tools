"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatFileSize } from "@/components/tools/pdf-utils";
import type { Locale } from "@/lib/content/types";
import {
  createPdfFromJpgs,
  type PdfImageMargin,
  type PdfImageOrientation,
  type PdfImagePageSize,
} from "@/lib/tools/pdf-images";

const MAX_FILES = 50;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;

type JpgFile = {
  file: File;
  height: number;
  id: string;
  previewUrl: string;
  width: number;
};

type PdfResult = {
  fileName: string;
  pageCount: number;
  size: number;
  url: string;
};

function isJpgFile(file: Pick<File, "name" | "type">) {
  return (
    file.type === "image/jpeg" || /\.(?:jpe?g)$/i.test(file.name)
  );
}

function imageBaseName(fileName: string) {
  return (
    fileName
      .replace(/\.(?:jpe?g)$/i, "")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/\s+/g, " ")
      .trim() || "images"
  );
}

export function JpgToPdf({ locale }: { locale: Locale }) {
  const copy =
    locale === "de"
      ? {
          title: "JPG-Bilder",
          intro:
            "Füge Bilder hinzu, lege ihre Reihenfolge fest und passe die PDF-Seiten an.",
          drop: "JPG-Bilder hier ablegen",
          choose: "Bilder auswählen",
          limits: `Bis zu ${MAX_FILES} JPGs und insgesamt 100 MB`,
          adding: "JPGs werden geprüft …",
          addMore: "Weitere JPGs",
          clear: "Alle entfernen",
          invalidType: "Wähle ausschließlich JPG- oder JPEG-Dateien aus.",
          tooMany: `Du kannst höchstens ${MAX_FILES} JPGs in eine PDF umwandeln.`,
          tooLarge: "Die ausgewählten Bilder dürfen zusammen maximal 100 MB groß sein.",
          readError: (name: string) =>
            `${name} konnte nicht gelesen werden. Die Datei ist möglicherweise beschädigt.`,
          selected: (count: number) =>
            `${count} ${count === 1 ? "Bild" : "Bilder"}`,
          dimensions: (width: number, height: number) => `${width} × ${height} px`,
          moveUp: (name: string) => `${name} nach oben verschieben`,
          moveDown: (name: string) => `${name} nach unten verschieben`,
          remove: (name: string) => `${name} entfernen`,
          pageSize: "Seitengröße",
          a4: "A4",
          letter: "US Letter",
          fit: "An Bild anpassen",
          orientation: "Ausrichtung",
          auto: "Automatisch",
          portrait: "Hochformat",
          landscape: "Querformat",
          margin: "Rand",
          none: "Ohne Rand",
          small: "Schmal · 6 mm",
          standard: "Standard · 13 mm",
          convert: "PDF erstellen",
          converting: "PDF wird erstellt …",
          convertError:
            "Die PDF konnte nicht erstellt werden. Prüfe die JPG-Dateien und versuche es erneut.",
          ready: (count: number) =>
            `PDF mit ${count} ${count === 1 ? "Seite" : "Seiten"} ist bereit`,
          download: "PDF herunterladen",
        }
      : {
          title: "JPG images",
          intro:
            "Add images, arrange their order, and customize the PDF pages.",
          drop: "Drop JPG images here",
          choose: "Choose images",
          limits: `Up to ${MAX_FILES} JPGs and 100 MB total`,
          adding: "Checking JPGs …",
          addMore: "Add more JPGs",
          clear: "Remove all",
          invalidType: "Choose JPG or JPEG files only.",
          tooMany: `You can convert up to ${MAX_FILES} JPGs into one PDF.`,
          tooLarge: "The selected images may not exceed 100 MB in total.",
          readError: (name: string) =>
            `${name} could not be read. The file may be damaged.`,
          selected: (count: number) =>
            `${count} ${count === 1 ? "image" : "images"}`,
          dimensions: (width: number, height: number) => `${width} × ${height} px`,
          moveUp: (name: string) => `Move ${name} up`,
          moveDown: (name: string) => `Move ${name} down`,
          remove: (name: string) => `Remove ${name}`,
          pageSize: "Page size",
          a4: "A4",
          letter: "US Letter",
          fit: "Fit to image",
          orientation: "Orientation",
          auto: "Automatic",
          portrait: "Portrait",
          landscape: "Landscape",
          margin: "Margin",
          none: "No margin",
          small: "Narrow · 6 mm",
          standard: "Standard · 13 mm",
          convert: "Create PDF",
          converting: "Creating PDF …",
          convertError:
            "The PDF could not be created. Check the JPG files and try again.",
          ready: (count: number) =>
            `PDF with ${count} ${count === 1 ? "page" : "pages"} is ready`,
          download: "Download PDF",
        };
  const [files, setFiles] = useState<JpgFile[]>([]);
  const [pageSize, setPageSize] = useState<PdfImagePageSize>("a4");
  const [orientation, setOrientation] =
    useState<PdfImageOrientation>("auto");
  const [margin, setMargin] = useState<PdfImageMargin>("standard");
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<PdfResult | null>(null);
  const resultUrl = useRef<string | null>(null);
  const previewUrls = useRef(new Set<string>());
  const totalBytes = useMemo(
    () => files.reduce((sum, item) => sum + item.file.size, 0),
    [files],
  );

  useEffect(
    () => () => {
      if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  function discardResult() {
    if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
    resultUrl.current = null;
    setResult(null);
  }

  function updateFiles(update: (current: JpgFile[]) => JpgFile[]) {
    discardResult();
    setError(null);
    setFiles(update);
  }

  function updateOption(update: () => void) {
    discardResult();
    setError(null);
    update();
  }

  function removeFile(id: string) {
    updateFiles((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
        previewUrls.current.delete(removed.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function clearFiles() {
    files.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      previewUrls.current.delete(item.previewUrl);
    });
    discardResult();
    setFiles([]);
    setError(null);
  }

  async function addFiles(incoming: FileList | File[]) {
    if (isAdding || isConverting) return;
    const selected = Array.from(incoming);
    if (!selected.length) return;
    if (selected.some((file) => !isJpgFile(file))) {
      setError(copy.invalidType);
      return;
    }
    if (files.length + selected.length > MAX_FILES) {
      setError(copy.tooMany);
      return;
    }
    if (
      totalBytes + selected.reduce((sum, file) => sum + file.size, 0) >
      MAX_TOTAL_BYTES
    ) {
      setError(copy.tooLarge);
      return;
    }

    discardResult();
    setError(null);
    setIsAdding(true);
    let activeFile = selected[0]?.name ?? "JPG";

    const additions: JpgFile[] = [];
    try {
      for (const file of selected) {
        activeFile = file.name;
        const bitmap = await createImageBitmap(file);
        const previewUrl = URL.createObjectURL(file);
        previewUrls.current.add(previewUrl);
        additions.push({
          id: crypto.randomUUID(),
          file,
          width: bitmap.width,
          height: bitmap.height,
          previewUrl,
        });
        bitmap.close();
      }
      setFiles((current) => [...current, ...additions]);
    } catch {
      additions.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        previewUrls.current.delete(item.previewUrl);
      });
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

  async function convertFiles() {
    if (!files.length || isConverting) return;

    discardResult();
    setError(null);
    setIsConverting(true);

    try {
      const sources = await Promise.all(
        files.map((item) => item.file.arrayBuffer()),
      );
      const bytes = await createPdfFromJpgs(sources, {
        pageSize,
        orientation,
        margin,
      });
      const blob = new Blob([Uint8Array.from(bytes).buffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const baseName = imageBaseName(files[0].file.name);
      resultUrl.current = url;
      setResult({
        url,
        size: blob.size,
        pageCount: files.length,
        fileName: `${baseName}-images.pdf`,
      });
      void fetch("/api/tools/jpg-to-pdf/use", {
        method: "POST",
        keepalive: true,
      });
    } catch {
      setError(copy.convertError);
    } finally {
      setIsConverting(false);
    }
  }

  const busy = isAdding || isConverting;

  return (
    <section className="pdf-workspace" aria-labelledby="jpg-to-pdf-title">
      <header className="pdf-workspace__header">
        <div>
          <h2 id="jpg-to-pdf-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        {files.length > 0 && (
          <label className="pdf-add-button" aria-disabled={busy}>
            <FilePlus2 aria-hidden="true" size={17} />
            {copy.addMore}
            <input
              type="file"
              accept="image/jpeg,.jpg,.jpeg"
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
            <ImageIcon aria-hidden="true" size={28} />
          )}
          <strong>{isAdding ? copy.adding : copy.drop}</strong>
          {!isAdding && <span>{copy.choose}</span>}
          <small>{copy.limits}</small>
          <input
            type="file"
            accept="image/jpeg,.jpg,.jpeg"
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
              <span className="pdf-file__thumbnail">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="" />
              </span>
              <span className="pdf-file__details">
                <strong title={item.file.name}>{item.file.name}</strong>
                <small>
                  {copy.dimensions(item.width, item.height)} ·{" "}
                  {formatFileSize(item.file.size, locale)}
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
                  onClick={() => removeFile(item.id)}
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

      {files.length > 0 && (
        <div className="pdf-converter-options pdf-converter-options--compact">
          <div className="pdf-converter-options__fields">
            <label>
              <span>{copy.pageSize}</span>
              <select
                value={pageSize}
                disabled={busy}
                onChange={(event) =>
                  updateOption(() =>
                    setPageSize(event.target.value as PdfImagePageSize),
                  )
                }
              >
                <option value="a4">{copy.a4}</option>
                <option value="letter">{copy.letter}</option>
                <option value="fit">{copy.fit}</option>
              </select>
            </label>
            <label>
              <span>{copy.orientation}</span>
              <select
                value={orientation}
                disabled={busy}
                onChange={(event) =>
                  updateOption(() =>
                    setOrientation(event.target.value as PdfImageOrientation),
                  )
                }
              >
                <option value="auto">{copy.auto}</option>
                <option value="portrait">{copy.portrait}</option>
                <option value="landscape">{copy.landscape}</option>
              </select>
            </label>
            <label>
              <span>{copy.margin}</span>
              <select
                value={margin}
                disabled={busy}
                onChange={(event) =>
                  updateOption(() =>
                    setMargin(event.target.value as PdfImageMargin),
                  )
                }
              >
                <option value="none">{copy.none}</option>
                <option value="small">{copy.small}</option>
                <option value="standard">{copy.standard}</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {result && (
        <div className="pdf-workspace__result" role="status">
          <CheckCircle2 aria-hidden="true" size={20} />
          <span>
            <strong>{copy.ready(result.pageCount)}</strong>
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
          {files.length > 0
            ? `${copy.selected(files.length)} · ${formatFileSize(totalBytes, locale)}`
            : copy.limits}
        </p>
        <div>
          {files.length > 0 && (
            <button
              className="action-secondary"
              type="button"
              disabled={busy}
              onClick={clearFiles}
            >
              {copy.clear}
            </button>
          )}
          {files.length > 0 && !result && (
            <button
              className="action-primary"
              type="button"
              disabled={busy}
              onClick={convertFiles}
            >
              {isConverting ? (
                <LoaderCircle
                  className="pdf-workspace__spinner"
                  aria-hidden="true"
                  size={17}
                />
              ) : (
                <FileText aria-hidden="true" size={17} />
              )}
              {isConverting ? copy.converting : copy.convert}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
