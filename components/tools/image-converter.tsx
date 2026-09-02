"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileImage,
  ImagePlus,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { formatFileSize } from "@/lib/tools/files";
import {
  convertImage,
  hasSafeImageDimensions,
  IMAGE_INPUT_ACCEPT,
  imageOutputFileName,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_PIXELS,
  MAX_IMAGE_SIDE,
  readImageDimensions,
  type ImageOutputFormat,
  validateImageFile,
} from "@/lib/tools/images";
import { reportToolUsage } from "@/lib/tools/usage-client";

type ImageSource = {
  file: File;
  height: number;
  previewUrl: string;
  width: number;
};

type ImageResult = {
  fileName: string;
  size: number;
  url: string;
};

const formatLabels: Record<ImageOutputFormat, string> = {
  jpeg: "JPG",
  png: "PNG",
  webp: "WebP",
};

function ImageConverter({
  format,
  locale,
}: {
  format: ImageOutputFormat;
  locale: Locale;
}) {
  const outputLabel = formatLabels[format];
  const copy =
    locale === "de"
      ? {
          title: "Bilddatei",
          intro: `Konvertiere ein JPG-, PNG- oder WebP-Bild direkt in ${outputLabel}.`,
          drop: "Bild hier ablegen",
          choose: "Bild auswählen",
          limit: `Browser-Limits: JPG, PNG oder WebP · ${MAX_IMAGE_BYTES / 1024 / 1024} MB · ${MAX_IMAGE_PIXELS / 1_000_000} MP · ${MAX_IMAGE_SIDE.toLocaleString("de-DE")} px je Seite`,
          reading: "Bild wird geprüft …",
          replace: "Bild ersetzen",
          remove: "Bild entfernen",
          oneFile: "Wähle genau eine Bilddatei aus.",
          invalidType: "Wähle eine gültige JPG-, PNG- oder WebP-Datei aus.",
          empty: "Die ausgewählte Bilddatei ist leer.",
          tooLarge: `Zum Schutz deines Browsers darf das Bild maximal ${MAX_IMAGE_BYTES / 1024 / 1024} MB groß sein.`,
          tooManyPixels: `Das Bild darf höchstens ${MAX_IMAGE_PIXELS / 1_000_000} Megapixel groß sein.`,
          tooWide: `Breite und Höhe dürfen jeweils höchstens ${MAX_IMAGE_SIDE.toLocaleString("de-DE")} Pixel betragen.`,
          readError:
            "Das Bild konnte nicht gelesen werden. Es ist möglicherweise beschädigt.",
          quality: `${outputLabel}-Qualität`,
          balanced: "Ausgewogen · 82 %",
          high: "Hoch · 92 %",
          maximum: "Maximal · 100 %",
          transparency:
            "Transparente Bildbereiche werden beim Export weiß hinterlegt.",
          local: "Das Bild bleibt auf diesem Gerät.",
          convert: `In ${outputLabel} konvertieren`,
          converting: `${outputLabel} wird erstellt …`,
          convertError: `${outputLabel} konnte nicht erstellt werden. Prüfe das Bild und versuche es erneut.`,
          ready: `${outputLabel} ist bereit`,
          download: `${outputLabel} herunterladen`,
          dimensions: (width: number, height: number) => `${width} × ${height} px`,
        }
      : {
          title: "Image file",
          intro: `Convert one JPG, PNG, or WebP image directly to ${outputLabel}.`,
          drop: "Drop an image here",
          choose: "Choose image",
          limit: `Browser limits: JPG, PNG, or WebP · ${MAX_IMAGE_BYTES / 1024 / 1024} MB · ${MAX_IMAGE_PIXELS / 1_000_000} MP · ${MAX_IMAGE_SIDE.toLocaleString("en-US")} px per side`,
          reading: "Checking image …",
          replace: "Replace image",
          remove: "Remove image",
          oneFile: "Choose exactly one image file.",
          invalidType: "Choose a valid JPG, PNG, or WebP file.",
          empty: "The selected image file is empty.",
          tooLarge: `To protect your browser, the image may not exceed ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
          tooManyPixels: `The image may contain up to ${MAX_IMAGE_PIXELS / 1_000_000} megapixels.`,
          tooWide: `Width and height may each be up to ${MAX_IMAGE_SIDE.toLocaleString("en-US")} pixels.`,
          readError: "The image could not be read. It may be damaged.",
          quality: `${outputLabel} quality`,
          balanced: "Balanced · 82%",
          high: "High · 92%",
          maximum: "Maximum · 100%",
          transparency:
            "Transparent areas are placed on a white background when exported.",
          local: "The image stays on this device.",
          convert: `Convert to ${outputLabel}`,
          converting: `Creating ${outputLabel} …`,
          convertError: `${outputLabel} could not be created. Check the image and try again.`,
          ready: `${outputLabel} is ready`,
          download: `Download ${outputLabel}`,
          dimensions: (width: number, height: number) => `${width} × ${height} px`,
        };
  const [source, setSource] = useState<ImageSource | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [quality, setQuality] = useState(0.92);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sourceUrl = useRef<string | null>(null);
  const resultUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
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
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
    sourceUrl.current = null;
    setSource(null);
    setError(null);
  }

  async function selectFile(incoming: FileList | File[]) {
    if (isReading || isConverting) return;
    const files = Array.from(incoming);
    if (!files.length) return;
    if (files.length !== 1) {
      setError(copy.oneFile);
      return;
    }

    setError(null);
    setIsReading(true);
    try {
      const file = files[0];
      const validation = await validateImageFile(file);
      if (!validation.ok) {
        setError(
          validation.reason === "empty"
            ? copy.empty
            : validation.reason === "too-large"
              ? copy.tooLarge
              : copy.invalidType,
        );
        return;
      }

      const { width, height } = await readImageDimensions(file);
      if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) {
        setError(copy.tooWide);
        return;
      }
      if (!hasSafeImageDimensions(width, height)) {
        setError(copy.tooManyPixels);
        return;
      }

      discardResult();
      if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
      const previewUrl = URL.createObjectURL(file);
      sourceUrl.current = previewUrl;
      setSource({ file, height, previewUrl, width });
    } catch {
      setError(copy.readError);
    } finally {
      setIsReading(false);
    }
  }

  async function runConversion() {
    if (!source || isConverting) return;
    discardResult();
    setError(null);
    setIsConverting(true);

    try {
      const blob = await convertImage(source.file, format, quality);
      const url = URL.createObjectURL(blob);
      resultUrl.current = url;
      setResult({
        fileName: imageOutputFileName(source.file.name, format),
        size: blob.size,
        url,
      });
      reportToolUsage(`image-to-${format === "jpeg" ? "jpg" : format}`);
    } catch {
      setError(copy.convertError);
    } finally {
      setIsConverting(false);
    }
  }

  const displayedImageUrl = result?.url ?? source?.previewUrl;

  return (
    <section className="image-workspace" aria-labelledby="image-workspace-title">
      <header className="image-workspace__header">
        <div>
          <h2 id="image-workspace-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        {source && (
          <label className="image-file-button" aria-disabled={isConverting}>
            <ImagePlus size={17} />
            {copy.replace}
            <input
              type="file"
              accept={IMAGE_INPUT_ACCEPT}
              disabled={isConverting}
              onChange={(event) => {
                void selectFile(event.target.files ?? []);
                event.currentTarget.value = "";
              }}
            />
          </label>
        )}
      </header>

      {!source && (
        <label
          className={`image-dropzone ${isDragging ? "image-dropzone--active" : ""}`}
          aria-disabled={isReading}
          aria-busy={isReading}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void selectFile(event.dataTransfer.files);
          }}
        >
          {isReading ? (
            <>
              <LoaderCircle className="image-workspace__spinner" size={30} />
              <strong role="status" aria-live="polite">
                {copy.reading}
              </strong>
            </>
          ) : (
            <>
              <span className="image-dropzone__icon">
                <FileImage size={25} />
              </span>
              <strong>{copy.drop}</strong>
              <span>{copy.choose}</span>
              <small>{copy.limit}</small>
            </>
          )}
          <input
            type="file"
            accept={IMAGE_INPUT_ACCEPT}
            disabled={isReading}
            onChange={(event) => {
              void selectFile(event.target.files ?? []);
              event.currentTarget.value = "";
            }}
          />
        </label>
      )}

      {error && (
        <p className="image-workspace__error" role="alert">
          <AlertCircle size={17} />
          {error}
        </p>
      )}

      {source && (
        <div className="image-converter">
          <div className="image-converter__preview">
            <div className="image-preview-checkerboard">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayedImageUrl} alt="" />
            </div>
          </div>

          <div className="image-converter__settings">
            <div className="image-converter__file">
              <span>
                <strong>{source.file.name}</strong>
                <small>
                  {copy.dimensions(source.width, source.height)} ·{" "}
                  {formatFileSize(source.file.size, locale)}
                </small>
              </span>
              <button
                type="button"
                onClick={clearSource}
                disabled={isConverting}
                aria-label={copy.remove}
                title={copy.remove}
              >
                <Trash2 size={17} />
              </button>
            </div>
            {format !== "png" && (
              <label>
                <span>{copy.quality}</span>
                <select
                  value={quality}
                  disabled={isConverting}
                  onChange={(event) => {
                    discardResult();
                    setQuality(Number(event.target.value));
                  }}
                >
                  <option value={0.82}>{copy.balanced}</option>
                  <option value={0.92}>{copy.high}</option>
                  <option value={1}>{copy.maximum}</option>
                </select>
              </label>
            )}
            {format === "jpeg" && <p>{copy.transparency}</p>}
            <p>{copy.local}</p>
            {result ? (
              <div className="image-converter__result" role="status">
                <CheckCircle2 size={20} />
                <span>
                  <strong>{copy.ready}</strong>
                  <small>{formatFileSize(result.size, locale)}</small>
                </span>
                <a href={result.url} download={result.fileName}>
                  <Download size={17} />
                  {copy.download}
                </a>
              </div>
            ) : (
              <button
                className="action-primary image-converter__action"
                type="button"
                onClick={() => void runConversion()}
                disabled={isConverting}
              >
                {isConverting ? (
                  <LoaderCircle
                    className="image-workspace__spinner"
                    size={17}
                  />
                ) : (
                  <FileImage size={17} />
                )}
                {isConverting ? copy.converting : copy.convert}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export function ImageToJpg({ locale }: { locale: Locale }) {
  return <ImageConverter format="jpeg" locale={locale} />;
}

export function ImageToPng({ locale }: { locale: Locale }) {
  return <ImageConverter format="png" locale={locale} />;
}

export function ImageToWebp({ locale }: { locale: Locale }) {
  return <ImageConverter format="webp" locale={locale} />;
}
