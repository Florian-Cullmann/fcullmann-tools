"use client";

import {
  CheckCircle2,
  Download,
  FileImage,
  FilePlus2,
  Images,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  extractPdfImagesAsJpegs,
  PdfImageLimitError,
  renderPdfPagesAsJpegs,
  type JpegOutput,
} from "@/lib/tools/pdf-to-jpg";
import {
  formatFileSize,
  isPdfFile,
  MAX_PDF_BYTES,
  pdfBaseName,
} from "@/lib/tools/files";
import type { Locale } from "@/lib/i18n/types";
import { getPdfPageCount } from "@/lib/tools/pdf";
import { reportToolUsage } from "@/lib/tools/usage-client";

const MAX_PAGES = 200;
const MAX_EXTRACTED_IMAGES = 500;

type ConversionMode = "pages" | "images";

type SourcePdf = {
  file: File;
  pageCount: number;
};

type ConversionResult = {
  count: number;
  fileName: string;
  size: number;
  url: string;
};

function safeBaseName(fileName: string) {
  return pdfBaseName(fileName)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

async function packageJpegs(outputs: JpegOutput[], baseName: string) {
  if (outputs.length === 1) {
    return {
      blob: outputs[0].blob,
      fileName: outputs[0].name,
    };
  }

  const { default: JSZip } = await import("jszip");
  const archive = new JSZip();
  outputs.forEach((output) => archive.file(output.name, output.blob));
  return {
    blob: await archive.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    }),
    fileName: `${baseName}-jpg.zip`,
  };
}

export function PdfToJpg({ locale }: { locale: Locale }) {
  const copy =
    locale === "de"
      ? {
          title: "PDF-Datei",
          intro:
            "Wandle jede Seite in ein JPG um oder exportiere eingebettete Rasterbilder.",
          drop: "PDF-Datei hier ablegen",
          choose: "Datei auswählen",
          limit: `Eine PDF bis 100 MB und ${MAX_PAGES} Seiten`,
          checking: "PDF wird geprüft …",
          replace: "PDF ersetzen",
          remove: "PDF entfernen",
          invalidType: "Wähle eine gültige PDF-Datei aus.",
          oneFile: "Wähle genau eine PDF-Datei aus.",
          tooLarge: "Die PDF-Datei darf maximal 100 MB groß sein.",
          tooLong: `Die PDF darf maximal ${MAX_PAGES} Seiten enthalten.`,
          readError:
            "Die PDF konnte nicht gelesen werden. Sie ist möglicherweise beschädigt oder passwortgeschützt.",
          mode: "Ausgabe",
          pagesMode: "Seiten umwandeln",
          pagesHelp: "Jede PDF-Seite wird vollständig als JPG gerendert.",
          imagesMode: "Bilder extrahieren",
          imagesHelp:
            "Eingebettete Rasterbilder werden einzeln exportiert; Text und Vektoren bleiben unberücksichtigt.",
          resolution: "Auflösung",
          standard: "Standard · 150 dpi",
          high: "Hoch · 216 dpi",
          maximum: "Maximal · 300 dpi",
          quality: "JPG-Qualität",
          balanced: "Ausgewogen · 82 %",
          detailed: "Detailreich · 92 %",
          progress: (done: number, total: number) =>
            `${done} von ${total} Seiten verarbeitet`,
          convert: "JPGs erstellen",
          converting: "JPGs werden erstellt …",
          convertError:
            "Die JPG-Dateien konnten nicht erstellt werden. Prüfe die PDF und versuche es erneut.",
          noImages:
            "Keine einzeln exportierbaren Rasterbilder gefunden. Nutze stattdessen „Seiten umwandeln“.",
          tooManyImages: `Die PDF enthält mehr als ${MAX_EXTRACTED_IMAGES} exportierbare Bilder. Teile das Dokument und verarbeite die Teile einzeln.`,
          pages: (count: number) =>
            `${count} ${count === 1 ? "Seite" : "Seiten"}`,
          ready: (count: number) =>
            `${count} ${count === 1 ? "JPG ist" : "JPGs sind"} bereit`,
          download: (count: number) =>
            count === 1 ? "JPG herunterladen" : "ZIP herunterladen",
          clear: "Datei entfernen",
        }
      : {
          title: "PDF file",
          intro:
            "Convert every page to JPG or export embedded raster images.",
          drop: "Drop a PDF file here",
          choose: "Choose file",
          limit: `One PDF up to 100 MB and ${MAX_PAGES} pages`,
          checking: "Checking PDF …",
          replace: "Replace PDF",
          remove: "Remove PDF",
          invalidType: "Choose a valid PDF file.",
          oneFile: "Choose exactly one PDF file.",
          tooLarge: "The PDF file may not exceed 100 MB.",
          tooLong: `The PDF may contain up to ${MAX_PAGES} pages.`,
          readError:
            "The PDF could not be read. It may be damaged or password-protected.",
          mode: "Output",
          pagesMode: "Convert pages",
          pagesHelp: "Every complete PDF page is rendered as a JPG image.",
          imagesMode: "Extract images",
          imagesHelp:
            "Embedded raster images are exported individually; text and vectors are ignored.",
          resolution: "Resolution",
          standard: "Standard · 150 dpi",
          high: "High · 216 dpi",
          maximum: "Maximum · 300 dpi",
          quality: "JPG quality",
          balanced: "Balanced · 82%",
          detailed: "Detailed · 92%",
          progress: (done: number, total: number) =>
            `${done} of ${total} pages processed`,
          convert: "Create JPGs",
          converting: "Creating JPGs …",
          convertError:
            "The JPG files could not be created. Check the PDF and try again.",
          noImages:
            "No individually exportable raster images were found. Use “Convert pages” instead.",
          tooManyImages: `The PDF contains more than ${MAX_EXTRACTED_IMAGES} exportable images. Split the document and process each part separately.`,
          pages: (count: number) =>
            `${count} ${count === 1 ? "page" : "pages"}`,
          ready: (count: number) =>
            `${count} ${count === 1 ? "JPG is" : "JPGs are"} ready`,
          download: (count: number) =>
            count === 1 ? "Download JPG" : "Download ZIP",
          clear: "Remove file",
        };
  const [source, setSource] = useState<SourcePdf | null>(null);
  const [mode, setMode] = useState<ConversionMode>("pages");
  const [dpi, setDpi] = useState(150);
  const [quality, setQuality] = useState(0.82);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
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
    setProgress(0);
    setError(null);
  }

  function updateSetting(update: () => void) {
    discardResult();
    setError(null);
    update();
  }

  async function selectFile(incoming: FileList | File[]) {
    if (isChecking || isConverting) return;
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
      if (pageCount > MAX_PAGES) {
        setError(copy.tooLong);
        return;
      }
      setSource({ file, pageCount });
      setProgress(0);
    } catch {
      setError(copy.readError);
    } finally {
      setIsChecking(false);
    }
  }

  async function convertFile() {
    if (!source || isConverting) return;

    discardResult();
    setError(null);
    setProgress(0);
    setIsConverting(true);
    let loadingTask: ReturnType<
      (typeof import("pdfjs-dist"))["getDocument"]
    > | null = null;

    try {
      const [pdfjs, data] = await Promise.all([
        import("pdfjs-dist/webpack.mjs"),
        source.file.arrayBuffer(),
      ]);
      loadingTask = pdfjs.getDocument({ data: new Uint8Array(data) });
      const document = await loadingTask.promise;
      const baseName = safeBaseName(source.file.name);
      const outputs =
        mode === "pages"
          ? await renderPdfPagesAsJpegs({
              document,
              dpi,
              quality,
              baseName,
              onProgress: setProgress,
            })
          : await extractPdfImagesAsJpegs({
              document,
              pdfjs,
              quality,
              baseName,
              maxImages: MAX_EXTRACTED_IMAGES,
              onProgress: setProgress,
            });

      if (!outputs.length) {
        setError(copy.noImages);
        return;
      }

      const packaged = await packageJpegs(outputs, baseName);
      const url = URL.createObjectURL(packaged.blob);
      resultUrl.current = url;
      setResult({
        url,
        size: packaged.blob.size,
        count: outputs.length,
        fileName: packaged.fileName,
      });
      reportToolUsage("pdf-to-jpg");
    } catch (conversionError) {
      setError(
        conversionError instanceof PdfImageLimitError
          ? copy.tooManyImages
          : copy.convertError,
      );
    } finally {
      await loadingTask?.destroy();
      setIsConverting(false);
    }
  }

  const busy = isChecking || isConverting;

  return (
    <section className="pdf-workspace" aria-labelledby="pdf-to-jpg-title">
      <header className="pdf-workspace__header">
        <div>
          <h2 id="pdf-to-jpg-title">{copy.title}</h2>
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
            <FileImage aria-hidden="true" size={28} />
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
          <div className="pdf-file pdf-converter__source">
            <span className="pdf-file__icon">
              <FileImage aria-hidden="true" size={21} />
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

          <div className="pdf-converter-options">
            <fieldset className="pdf-converter-options__mode">
              <legend>{copy.mode}</legend>
              <label>
                <input
                  type="radio"
                  name="pdf-jpg-mode"
                  value="pages"
                  checked={mode === "pages"}
                  disabled={busy}
                  onChange={() => updateSetting(() => setMode("pages"))}
                />
                <span>
                  <FileImage aria-hidden="true" size={18} />
                  <strong>{copy.pagesMode}</strong>
                  <small>{copy.pagesHelp}</small>
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  name="pdf-jpg-mode"
                  value="images"
                  checked={mode === "images"}
                  disabled={busy}
                  onChange={() => updateSetting(() => setMode("images"))}
                />
                <span>
                  <Images aria-hidden="true" size={18} />
                  <strong>{copy.imagesMode}</strong>
                  <small>{copy.imagesHelp}</small>
                </span>
              </label>
            </fieldset>
            <div className="pdf-converter-options__fields">
              {mode === "pages" && (
                <label>
                  <span>{copy.resolution}</span>
                  <select
                    value={dpi}
                    disabled={busy}
                    onChange={(event) =>
                      updateSetting(() => setDpi(Number(event.target.value)))
                    }
                  >
                    <option value={150}>{copy.standard}</option>
                    <option value={216}>{copy.high}</option>
                    <option value={300}>{copy.maximum}</option>
                  </select>
                </label>
              )}
              <label>
                <span>{copy.quality}</span>
                <select
                  value={quality}
                  disabled={busy}
                  onChange={(event) =>
                    updateSetting(() => setQuality(Number(event.target.value)))
                  }
                >
                  <option value={0.82}>{copy.balanced}</option>
                  <option value={0.92}>{copy.detailed}</option>
                </select>
              </label>
            </div>
          </div>
        </>
      )}

      {isConverting && source && (
        <p className="pdf-converter-progress" role="status">
          <LoaderCircle
            className="pdf-workspace__spinner"
            aria-hidden="true"
            size={18}
          />
          <span>
            <strong>{copy.converting}</strong>
            <small>{copy.progress(progress, source.pageCount)}</small>
          </span>
        </p>
      )}

      {result && (
        <div className="pdf-workspace__result" role="status">
          <CheckCircle2 aria-hidden="true" size={20} />
          <span>
            <strong>{copy.ready(result.count)}</strong>
            <small>{formatFileSize(result.size, locale)}</small>
          </span>
          <a href={result.url} download={result.fileName}>
            <Download aria-hidden="true" size={17} />
            {copy.download(result.count)}
          </a>
        </div>
      )}

      <footer className="pdf-workspace__footer">
        <p aria-live="polite">
          {source ? copy.pages(source.pageCount) : copy.limit}
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
              onClick={convertFile}
            >
              {isConverting ? (
                <LoaderCircle
                  className="pdf-workspace__spinner"
                  aria-hidden="true"
                  size={17}
                />
              ) : (
                <Images aria-hidden="true" size={17} />
              )}
              {isConverting ? copy.converting : copy.convert}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
