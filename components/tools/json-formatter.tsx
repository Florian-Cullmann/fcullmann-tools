"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Clipboard, Play, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n/messages";
import { formatJson as parseAndFormatJson } from "@/lib/tools/json";

const initialJson = `{"name":"Florian Cullmann","website":"fcullmann.com","focus":["tools","systems","developer experience"],"available":true}`;

export function JsonFormatter({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const { common } = getMessages(locale);
  const [input, setInput] = useState(initialJson);
  const [output, setOutput] = useState(() => {
    const result = parseAndFormatJson(initialJson);
    return result.ok ? result.value : "";
  });
  const [status, setStatus] = useState<"valid" | "dirty" | "invalid" | "idle">(
    "valid",
  );
  const [copyError, setCopyError] = useState(false);
  const [copied, setCopied] = useState(false);
  const tracked = useRef(false);
  const lineCount = useMemo(() => output.split("\n").length, [output]);

  async function formatJson() {
    const result = parseAndFormatJson(input);
    if (result.ok) {
      setOutput(result.value);
      setStatus("valid");
      if (!tracked.current) {
        tracked.current = true;
        void fetch("/api/tools/json-formatter/use", {
          method: "POST",
          keepalive: true,
        });
      }
    } else setStatus("invalid");
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      setCopyError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  function clear() {
    setInput("");
    setOutput("");
    setStatus("idle");
    setCopyError(false);
  }

  const statusText =
    status === "valid"
      ? common.jsonValid
      : status === "invalid"
        ? common.jsonInvalid
        : status === "dirty"
          ? common.jsonDirty
          : common.jsonIdle;

  return (
    <section
      className={`formatter ${compact ? "formatter--compact" : ""}`}
      aria-labelledby="formatter-title"
    >
      <div className="formatter__head">
        <div>
          <h2 id="formatter-title">JSON Formatter</h2>
        </div>
        <span
          className={`status ${status === "invalid" ? "status--error" : status !== "valid" ? "status--neutral" : ""}`}
          role="status"
        >
          {status === "valid" && <Check size={14} />} {statusText}
        </span>
      </div>
      <div className="formatter__panes">
        <label className="code-field">
          <span className="code-field__label">
            {common.input} <small>JSON</small>
          </span>
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setStatus(event.target.value ? "dirty" : "idle");
              setCopyError(false);
            }}
            spellCheck={false}
            aria-describedby={status === "invalid" ? "json-error" : undefined}
          />
        </label>
        <div className="code-field code-field--output">
          <div className="code-field__label">
            <span>
              {common.output} <small>JSON</small>
            </span>
            <button type="button" onClick={copyOutput} disabled={!output}>
              <Clipboard size={14} /> {copied ? common.copied : common.copy}
            </button>
          </div>
          <ol className="code-output" tabIndex={0} aria-label={common.output}>
            {output.split("\n").map((line, index) => (
              <li key={`${index}-${line}`}>
                <code>{line || " "}</code>
              </li>
            ))}
          </ol>
          <span className="line-count">
            {lineCount} {locale === "de" ? "Zeilen" : "lines"}
          </span>
        </div>
      </div>
      {status === "invalid" && (
        <p className="formatter__error" id="json-error">
          {common.jsonError}
        </p>
      )}
      {copyError && (
        <p className="formatter__error" role="alert">
          {common.copyError}
        </p>
      )}
      <div className="formatter__actions">
        <button className="action-primary" type="button" onClick={formatJson}>
          <Play size={17} />{" "}
          {locale === "de" ? "JSON formatieren" : "Format JSON"}
        </button>
        <button className="action-secondary" type="button" onClick={clear}>
          <Trash2 size={16} /> {common.clear}
        </button>
      </div>
    </section>
  );
}
