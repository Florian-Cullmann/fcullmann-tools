"use client";

import {
  Download,
  ImagePlus,
  LoaderCircle,
  RotateCw,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import {
  hasSafeImageDimensions,
  MAX_IMAGE_BYTES,
  readImageDimensions,
} from "@/lib/tools/images";
import {
  matchesOrientation,
  MAX_ROTATION_FILES,
  ROTATION_ACCEPT,
  rotateImage,
  rotationImageType,
  type OrientationFilter,
  type Rotation,
} from "@/lib/tools/image-rotate";
import { reportToolUsage } from "@/lib/tools/usage-client";

type Source = {
  id: string;
  file: File;
  width: number;
  height: number;
  url: string;
};
type Result = { name: string; url: string };

export function ImageRotate({ locale }: { locale: Locale }) {
  const de = locale === "de";
  const [sources, setSources] = useState<Source[]>([]);
  const [angle, setAngle] = useState<Rotation>(90);
  const [filter, setFilter] = useState<OrientationFilter>("all");
  const [results, setResults] = useState<Result[]>([]);
  const [archive, setArchive] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [dragging, setDragging] = useState(false);
  const locked = useRef(false);
  const alive = useRef(true);
  const urls = useRef(new Set<string>());
  useEffect(() => {
    alive.current = true;
    const ownedUrls = urls.current;
    return () => {
      alive.current = false;
      ownedUrls.forEach((url) => URL.revokeObjectURL(url));
      ownedUrls.clear();
    };
  }, []);
  function release(url: string) {
    URL.revokeObjectURL(url);
    urls.current.delete(url);
  }
  function own(blob: Blob) {
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    return url;
  }
  function discardResults() {
    results.forEach((result) => release(result.url));
    if (archive) release(archive);
    setResults([]);
    setArchive(null);
  }
  const selected = sources.filter((source) =>
    matchesOrientation(source.width, source.height, filter),
  );

  async function addFiles(files: File[]) {
    if (locked.current || !files.length) return;
    if (
      sources.length + files.length > MAX_ROTATION_FILES ||
      [...sources.map((source) => source.file), ...files].reduce(
        (sum, file) => sum + file.size,
        0,
      ) > MAX_IMAGE_BYTES
    ) {
      setErrors([
        de
          ? "Maximal 30 Bilder und insgesamt 100 MB auswählen."
          : "Choose up to 30 images and 100 MB in total.",
      ]);
      return;
    }
    locked.current = true;
    setBusy(true);
    setErrors([]);
    discardResults();
    const added: Source[] = [];
    const failures: string[] = [];
    let pixels = sources.reduce(
      (sum, source) => sum + source.width * source.height,
      0,
    );
    try {
      for (const file of files) {
        if (!alive.current) break;
        setProgress(de ? `Prüfe ${file.name} …` : `Checking ${file.name} …`);
        try {
          await rotationImageType(file);
          const dimensions = await readImageDimensions(file);
          if (
            !hasSafeImageDimensions(dimensions.width, dimensions.height) ||
            pixels + dimensions.width * dimensions.height > 100_000_000
          )
            throw new Error("limit");
          if (!alive.current) break;
          pixels += dimensions.width * dimensions.height;
          added.push({
            id: crypto.randomUUID(),
            file,
            ...dimensions,
            url: own(file),
          });
        } catch {
          failures.push(
            de
              ? `${file.name}: Nicht lesbar oder Bildlimit überschritten (JPG, PNG, GIF; 40 MP/Bild, 16.384 px/Seite, 100 MP insgesamt).`
              : `${file.name}: Unreadable or image limit exceeded (JPG, PNG, GIF; 40 MP/image, 16,384 px/side, 100 MP total).`,
          );
        }
      }
      if (alive.current) {
        setSources((previous) => [...previous, ...added]);
        setErrors(failures);
      }
    } finally {
      locked.current = false;
      if (alive.current) {
        setBusy(false);
        setProgress("");
      }
    }
  }

  async function run() {
    if (locked.current || !selected.length) return;
    locked.current = true;
    setBusy(true);
    setErrors([]);
    discardResults();
    const completed: Result[] = [];
    const failures: string[] = [];
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const [index, source] of selected.entries()) {
        if (!alive.current) return;
        setProgress(`${index + 1} / ${selected.length}: ${source.file.name}`);
        try {
          const blob = await rotateImage(source.file, angle);
          if (!alive.current) return;
          const base =
            source.file.name
              .replace(/\.[^.]+$/, "")
              .replace(/[\\/\x00-\x1f]/g, "_") || "image";
          const extension = source.file.name.split(".").pop()!.toLowerCase();
          const name = `${String(index + 1).padStart(2, "0")}-${base}-${angle}.${extension}`;
          zip.file(name, blob);
          completed.push({ name, url: own(blob) });
        } catch {
          failures.push(
            de
              ? `${source.file.name}: Drehen fehlgeschlagen. GIFs dürfen insgesamt höchstens 100 Millionen Frame-Pixel enthalten.`
              : `${source.file.name}: Rotation failed. GIFs may contain up to 100 million frame pixels in total.`,
          );
        }
      }
      if (completed.length > 1) {
        try {
          const blob = await zip.generateAsync({ type: "blob" });
          if (!alive.current) return;
          setArchive(own(blob));
        } catch {
          failures.push(
            de
              ? "ZIP konnte nicht erstellt werden. Die Bilder sind einzeln verfügbar."
              : "Could not create ZIP. Individual images are available.",
          );
        }
      }
      if (alive.current) {
        setResults(completed);
        setErrors(failures);
        if (completed.length) reportToolUsage("image-rotate");
      }
    } catch {
      if (alive.current)
        setErrors([
          de
            ? "Verarbeitung fehlgeschlagen. Bitte erneut versuchen."
            : "Processing failed. Please try again.",
        ]);
    } finally {
      locked.current = false;
      if (alive.current) {
        setBusy(false);
        setProgress("");
      }
    }
  }

  return (
    <section
      className="image-workspace rotation-workspace"
      aria-labelledby="rotation-title"
    >
      <header className="image-workspace__header">
        <div>
          <h2 id="rotation-title">{de ? "Bild drehen" : "Rotate images"}</h2>
          <p>
            {de
              ? "Mehrere JPG-, PNG- oder GIF-Bilder gleichzeitig drehen. Alle Dateien bleiben auf diesem Gerät. GIF-Animationen bleiben erhalten."
              : "Rotate multiple JPG, PNG, or GIF images. All files stay on this device. GIF animations are preserved."}
          </p>
        </div>
      </header>
      <label
        className={`image-dropzone ${dragging ? "image-dropzone--active" : ""}`}
        aria-disabled={busy}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <ImagePlus size={28} />
        <strong>
          {de
            ? "Bilder hier ablegen oder auswählen"
            : "Drop images here or choose files"}
        </strong>
        <small>
          {de
            ? "JPG, PNG, GIF · bis zu 30 Bilder · insgesamt 100 MB"
            : "JPG, PNG, GIF · up to 30 images · 100 MB total"}
        </small>
        <input
          type="file"
          multiple
          accept={ROTATION_ACCEPT}
          disabled={busy}
          onChange={(event) => {
            void addFiles(Array.from(event.target.files ?? []));
            event.currentTarget.value = "";
          }}
        />
      </label>
      {errors.length > 0 && (
        <div className="image-workspace__error" role="alert">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {sources.length > 0 && (
        <>
          <div className="image-converter__settings rotation-settings">
            <label>
              <span>{de ? "Drehung" : "Rotation"}</span>
              <select
                value={angle}
                disabled={busy}
                onChange={(event) => {
                  discardResults();
                  setAngle(Number(event.target.value) as Rotation);
                }}
              >
                <option value={90}>
                  {de ? "90° nach rechts" : "90° clockwise"}
                </option>
                <option value={180}>180°</option>
                <option value={270}>
                  {de ? "90° nach links" : "90° counterclockwise"}
                </option>
              </select>
            </label>
            <label>
              <span>
                {de ? "Welche Bilder drehen?" : "Which images to rotate?"}
              </span>
              <select
                value={filter}
                disabled={busy}
                onChange={(event) => {
                  discardResults();
                  setFilter(event.target.value as OrientationFilter);
                }}
              >
                <option value="all">{de ? "Alle Bilder" : "All images"}</option>
                <option value="landscape">
                  {de ? "Nur Querformat" : "Landscape only"}
                </option>
                <option value="portrait">
                  {de ? "Nur Hochformat" : "Portrait only"}
                </option>
              </select>
            </label>
            <p>
              {de
                ? `${selected.length} von ${sources.length} Bildern werden gedreht und exportiert. Der Filter bezieht sich auf das Original; quadratische Bilder zählen nur bei „Alle Bilder“.`
                : `${selected.length} of ${sources.length} images will be rotated and exported. The filter uses the original orientation; square images are included only with “All images”.`}
            </p>
            <p>
              {de
                ? "Vorschau zeigt die gewählte Drehung. JPG wird mit hoher Qualität neu gespeichert; PNG-Transparenz bleibt erhalten."
                : "Previews show the selected rotation. JPG is re-encoded at high quality; PNG transparency is preserved."}
            </p>
          </div>
          <div className="rotation-grid">
            {sources.map((source) => {
              const included = matchesOrientation(
                source.width,
                source.height,
                filter,
              );
              const rotation = included ? angle : 0;
              const swapped = rotation === 90 || rotation === 270;
              const scale = 160 / Math.max(source.width, source.height);
              return (
                <article
                  className={`rotation-card ${included ? "" : "rotation-card--excluded"}`}
                  key={source.id}
                >
                  <div className="rotation-preview image-preview-checkerboard">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={source.url}
                      alt={source.file.name}
                      style={{
                        width: source.width * scale,
                        height: source.height * scale,
                        transform: `rotate(${rotation}deg)`,
                      }}
                    />
                  </div>
                  <div className="image-converter__file">
                    <span>
                      <strong title={source.file.name}>
                        {source.file.name}
                      </strong>
                      <small>
                        {swapped ? source.height : source.width} ×{" "}
                        {swapped ? source.width : source.height} px ·{" "}
                        {included
                          ? `${angle}°`
                          : de
                            ? "Übersprungen"
                            : "Skipped"}
                      </small>
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      aria-label={`${de ? "Entfernen" : "Remove"}: ${source.file.name}`}
                      onClick={() => {
                        discardResults();
                        release(source.url);
                        setSources((previous) =>
                          previous.filter((item) => item.id !== source.id),
                        );
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <button
            className="action-primary image-converter__action"
            type="button"
            disabled={busy || !selected.length}
            onClick={() => void run()}
          >
            <RotateCw size={17} />
            {de ? "Bilder drehen" : "Rotate images"}
          </button>
        </>
      )}
      {busy && (
        <p className="rotation-progress" role="status">
          <LoaderCircle className="image-workspace__spinner" size={18} />
          {progress || (de ? "Verarbeitung …" : "Processing …")}
        </p>
      )}
      {results.length > 0 && (
        <div className="rotation-results">
          <p role="status">
            {de
              ? `${results.length} Bilder bereit`
              : `${results.length} images ready`}
          </p>
          {archive && (
            <a
              className="action-primary"
              href={archive}
              download="rotated-images.zip"
            >
              <Download size={17} />
              {de ? "Alle als ZIP herunterladen" : "Download all as ZIP"}
            </a>
          )}
          {results.map((result) => (
            <a key={result.url} href={result.url} download={result.name}>
              <Download size={17} />
              {result.name}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
