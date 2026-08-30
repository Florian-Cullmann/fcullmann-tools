"use client";

import { useState } from "react";
import { Clipboard, RefreshCw } from "lucide-react";
import type { Locale } from "@/lib/content/types";

function ToolFrame({ title, locale, input, output, setInput, action, secondaryAction, actionLabel, secondaryLabel }: {
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
  return (
    <section className="standalone-tool" aria-labelledby="tool-workspace-title">
      <div className="standalone-tool__header"><h2 id="tool-workspace-title">{title}</h2><span>{locale === "de" ? "Lokal verarbeitet" : "Processed locally"}</span></div>
      <div className="standalone-tool__grid">
        <label><span>{locale === "de" ? "Eingabe" : "Input"}</span><textarea value={input} onChange={(event) => setInput(event.target.value)} /></label>
        <label><span>{locale === "de" ? "Ergebnis" : "Output"}</span><textarea readOnly value={output} /></label>
      </div>
      <div className="formatter__actions">
        <button className="action-primary" type="button" onClick={action}><RefreshCw size={16} />{actionLabel}</button>
        {secondaryAction && <button className="action-secondary" type="button" onClick={secondaryAction}>{secondaryLabel}</button>}
        <button className="action-secondary" type="button" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}><Clipboard size={16} />{locale === "de" ? "Kopieren" : "Copy"}</button>
      </div>
    </section>
  );
}

export function Base64Tool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState("Useful software, carefully made.");
  const [output, setOutput] = useState("");
  const encode = () => setOutput(btoa(unescape(encodeURIComponent(input))));
  const decode = () => {
    try { setOutput(decodeURIComponent(escape(atob(input)))); } catch { setOutput(locale === "de" ? "Ungültige Base64-Eingabe" : "Invalid Base64 input"); }
  };
  return <ToolFrame title="Base64" locale={locale} input={input} output={output} setInput={setInput} action={encode} secondaryAction={decode} actionLabel={locale === "de" ? "Kodieren" : "Encode"} secondaryLabel={locale === "de" ? "Dekodieren" : "Decode"} />;
}

export function UuidTool({ locale }: { locale: Locale }) {
  const [count, setCount] = useState("5");
  const [output, setOutput] = useState("");
  const generate = () => {
    const amount = Math.min(100, Math.max(1, Number.parseInt(count, 10) || 1));
    setOutput(Array.from({ length: amount }, () => crypto.randomUUID()).join("\n"));
  };
  return <ToolFrame title="UUID v4" locale={locale} input={count} output={output} setInput={setCount} action={generate} actionLabel={locale === "de" ? "UUIDs erzeugen" : "Generate UUIDs"} />;
}

export function UrlCodecTool({ locale }: { locale: Locale }) {
  const [input, setInput] = useState("florian ullmann/tools?format=json");
  const [output, setOutput] = useState("");
  const encode = () => setOutput(encodeURIComponent(input));
  const decode = () => {
    try { setOutput(decodeURIComponent(input)); } catch { setOutput(locale === "de" ? "Ungültige URL-Kodierung" : "Invalid URL encoding"); }
  };
  return <ToolFrame title="URL Codec" locale={locale} input={input} output={output} setInput={setInput} action={encode} secondaryAction={decode} actionLabel={locale === "de" ? "Kodieren" : "Encode"} secondaryLabel={locale === "de" ? "Dekodieren" : "Decode"} />;
}
