"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ToolGlyph } from "@/components/tools/tool-glyph";
import type { Locale, ToolRecord } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n/messages";

export function ToolCatalog({ locale, tools }: { locale: Locale; tools: ToolRecord[] }) {
  const [query, setQuery] = useState("");
  const { tools: messages } = getMessages(locale);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    if (!normalized) return tools;
    return tools.filter((tool) => `${tool.name[locale]} ${tool.summary[locale]} ${tool.category}`.toLocaleLowerCase(locale).includes(normalized));
  }, [locale, query, tools]);

  return (
    <div className="tool-catalog">
      <label className="catalog-search"><Search size={18} /><span className="sr-only">{messages.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={messages.search} type="search" /></label>
      <p className="coordinate-label">{filtered.length} / {tools.length} DESTINATIONS</p>
      <div className="catalog-list" aria-live="polite">
        {filtered.map((tool, index) => (
          <Link className="catalog-item" href={`/${locale}/tools/${tool.slug}`} key={tool.id}>
            <span className="catalog-item__index">T-{String(index + 1).padStart(3, "0")}</span>
            <span className="catalog-item__icon"><ToolGlyph name={tool.icon} /></span>
            <span><strong>{tool.name[locale]}</strong><small>{tool.summary[locale]}</small></span>
            <span className="catalog-item__category">{tool.category}</span>
            <ArrowRight size={19} />
          </Link>
        ))}
        {!filtered.length && <p className="empty-state">{messages.noResults}</p>}
      </div>
    </div>
  );
}
