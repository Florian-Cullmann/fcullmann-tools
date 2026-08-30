"use client";

import { useState } from "react";
import { Clipboard, RefreshCw } from "lucide-react";
import type { Locale } from "@/lib/content/types";
import {
  getTextStats,
  hexToRgb,
  parseTimestamp,
  toSlug,
  toTitleCase,
} from "@/lib/tools/converters";

function ToolFrame({
  slug,
  title,
  locale,
  input,
  output,
  setInput,
  action,
  secondaryAction,
  actionLabel,
  secondaryLabel,
}: {
  slug: string;
  title: string;
  locale: Locale;
  input: string;
  output: string;
  setInput: (value: string) => void;
  action: () => void;
  secondaryAction?: () => void;
  actionLabel: string;
  secondaryLabel?: string;
}) {
  function trackUse() {
    void fetch(`/api/tools/${slug}/use`, { method: "POST", keepalive: true });
  }

  async function run(actionToRun: () => void) {
    await actionToRun();
    trackUse();
  }

  return (
    <section className="standalone-tool" aria-labelledby="tool-workspace-title">
      <div className="standalone-tool__header">
        <h2 id="tool-workspace-title">{title}</h2>
        <span>
          {locale === "de" ? "Lokal verarbeitet" : "Processed locally"}
        </span>
      </div>
      <div className="standalone-tool__grid">
        <label>
          <span>{locale === "de" ? "Eingabe" : "Input"}</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <label>
          <span>{locale === "de" ? "Ergebnis" : "Output"}</span>
          <textarea readOnly value={output} />
        </label>
      </div>
      <div className="formatter__actions">
        <button
          className="action-primary"
          type="button"
          onClick={() => run(action)}
        >
          <RefreshCw size={16} />
          {actionLabel}
        </button>
        {secondaryAction && (
          <button
            className="action-secondary"
            type="button"
            onClick={() => run(secondaryAction)}
          >
            {secondaryLabel}
          </button>
        )}
        <button
          className="action-secondary"
          type="button"
          onClick={() => navigator.clipboard.writeText(output)}
          disabled={!output}
        >
          <Clipboard size={16} />
          {locale === "de" ? "Kopieren" : "Copy"}
        </button>
      </div>
    </section>
  );
}

export function Base64Tool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState("Useful software, carefully made.");
  const [output, setOutput] = useState("");
  const encode = () => setOutput(btoa(unescape(encodeURIComponent(input))));
  const decode = () => {
    try {
      setOutput(decodeURIComponent(escape(atob(input))));
    } catch {
      setOutput(
        locale === "de" ? "Ungültige Base64-Eingabe" : "Invalid Base64 input",
      );
    }
  };
  return (
    <ToolFrame
      slug="base64"
      title="Base64"
      locale={locale}
      input={input}
      output={output}
      setInput={setInput}
      action={encode}
      secondaryAction={decode}
      actionLabel={locale === "de" ? "Kodieren" : "Encode"}
      secondaryLabel={locale === "de" ? "Dekodieren" : "Decode"}
    />
  );
}

export function UuidTool({ locale }: { locale: Locale }) {
  const [count, setCount] = useState("5");
  const [output, setOutput] = useState("");
  const generate = () => {
    const amount = Math.min(100, Math.max(1, Number.parseInt(count, 10) || 1));
    setOutput(
      Array.from({ length: amount }, () => crypto.randomUUID()).join("\n"),
    );
  };
  return (
    <ToolFrame
      slug="uuid-generator"
      title="UUID v4"
      locale={locale}
      input={count}
      output={output}
      setInput={setCount}
      action={generate}
      actionLabel={locale === "de" ? "UUIDs erzeugen" : "Generate UUIDs"}
    />
  );
}

export function UrlCodecTool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState("florian ullmann/tools?format=json");
  const [output, setOutput] = useState("");
  const encode = () => setOutput(encodeURIComponent(input));
  const decode = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch {
      setOutput(
        locale === "de" ? "Ungültige URL-Kodierung" : "Invalid URL encoding",
      );
    }
  };
  return (
    <ToolFrame
      slug="url-encoder"
      title="URL Codec"
      locale={locale}
      input={input}
      output={output}
      setInput={setInput}
      action={encode}
      secondaryAction={decode}
      actionLabel={locale === "de" ? "Kodieren" : "Encode"}
      secondaryLabel={locale === "de" ? "Dekodieren" : "Decode"}
    />
  );
}

export function HashGeneratorTool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState("Useful software, carefully made.");
  const [output, setOutput] = useState("");
  const generate = async () => {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(input),
    );
    setOutput(
      Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join(""),
    );
  };
  return (
    <ToolFrame
      slug="hash-generator"
      title="SHA-256"
      locale={locale}
      input={input}
      output={output}
      setInput={setInput}
      action={generate}
      actionLabel={locale === "de" ? "Hash erzeugen" : "Generate hash"}
    />
  );
}

export function TimestampConverterTool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState(new Date().toISOString());
  const [output, setOutput] = useState("");
  const convert = () => {
    const result = parseTimestamp(input);
    if (!result) {
      setOutput(
        locale === "de"
          ? "Ungültiges Datum oder ungültiger Zeitstempel"
          : "Invalid date or timestamp",
      );
      return;
    }
    setOutput(
      `ISO 8601: ${result.iso}\nUnix seconds: ${result.seconds}\nUnix milliseconds: ${result.milliseconds}`,
    );
  };
  return (
    <ToolFrame
      slug="timestamp-converter"
      title={locale === "de" ? "Zeitstempel" : "Timestamp"}
      locale={locale}
      input={input}
      output={output}
      setInput={setInput}
      action={convert}
      actionLabel={locale === "de" ? "Konvertieren" : "Convert"}
    />
  );
}

export function CaseConverterTool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState("Useful software, carefully made.");
  const [output, setOutput] = useState("");
  const titleCase = () => setOutput(toTitleCase(input, locale));
  const uppercase = () => setOutput(input.toLocaleUpperCase(locale));
  return (
    <ToolFrame
      slug="case-converter"
      title={locale === "de" ? "Schreibweise" : "Text case"}
      locale={locale}
      input={input}
      output={output}
      setInput={setInput}
      action={titleCase}
      secondaryAction={uppercase}
      actionLabel={locale === "de" ? "Titelschreibung" : "Title case"}
      secondaryLabel={locale === "de" ? "Großschreibung" : "Uppercase"}
    />
  );
}

export function ColorConverterTool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState("#e84b3c");
  const [output, setOutput] = useState("");
  const convert = () => {
    const result = hexToRgb(input);
    if (!result) {
      setOutput(locale === "de" ? "Ungültige HEX-Farbe" : "Invalid HEX color");
      return;
    }
    setOutput(
      `HEX: ${result.hex}\nRGB: rgb(${result.red}, ${result.green}, ${result.blue})\nChannels: R ${result.red} · G ${result.green} · B ${result.blue}`,
    );
  };
  return (
    <ToolFrame
      slug="color-converter"
      title={locale === "de" ? "Farbkonverter" : "Color converter"}
      locale={locale}
      input={input}
      output={output}
      setInput={setInput}
      action={convert}
      actionLabel={locale === "de" ? "Farbe konvertieren" : "Convert color"}
    />
  );
}

export function WordCounterTool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState(
    "Useful software should make focused work feel lighter.",
  );
  const [output, setOutput] = useState("");
  const count = () => {
    const stats = getTextStats(input);
    setOutput(
      `${locale === "de" ? "Wörter" : "Words"}: ${stats.words}\n${locale === "de" ? "Zeichen" : "Characters"}: ${stats.characters}\n${locale === "de" ? "Zeichen ohne Leerraum" : "Characters without spaces"}: ${stats.charactersWithoutSpaces}\n${locale === "de" ? "Zeilen" : "Lines"}: ${stats.lines}`,
    );
  };
  return (
    <ToolFrame
      slug="word-counter"
      title={locale === "de" ? "Wortzähler" : "Word counter"}
      locale={locale}
      input={input}
      output={output}
      setInput={setInput}
      action={count}
      actionLabel={locale === "de" ? "Text zählen" : "Count text"}
    />
  );
}

export function SlugGeneratorTool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState("Useful software, carefully made");
  const [output, setOutput] = useState("");
  const generate = () => setOutput(toSlug(input, locale));
  return (
    <ToolFrame
      slug="slug-generator"
      title={locale === "de" ? "Slug-Generator" : "Slug generator"}
      locale={locale}
      input={input}
      output={output}
      setInput={setInput}
      action={generate}
      actionLabel={locale === "de" ? "Slug erzeugen" : "Generate slug"}
    />
  );
}
