"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ToolGlyph } from "@/components/tools/tool-glyph";
import type { ToolRecord } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/types";
import { getMessages } from "@/lib/i18n/messages";
import { getToolCategoryLabel } from "@/lib/tools/categories";

export function ToolCatalog({
  locale,
  tools,
}: {
  locale: Locale;
  tools: ToolRecord[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const { tools: messages } = getMessages(locale);
  const categories = useMemo(
    () => [...new Set(tools.map((tool) => tool.category))],
    [tools],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return tools.filter((tool) => {
      const matchesCategory = category === "all" || tool.category === category;
      return (
        matchesCategory &&
        (!normalized ||
          `${tool.name[locale]} ${tool.summary[locale]} ${tool.category}`
            .toLocaleLowerCase(locale)
            .includes(normalized))
      );
    });
  }, [category, locale, query, tools]);

  return (
    <div className="tool-catalog">
      <label className="catalog-search">
        <Search size={18} />
        <span className="sr-only">{messages.search}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={messages.search}
          type="search"
        />
      </label>
      <div
        className="category-filters category-filters--catalog"
        aria-label={locale === "de" ? "Tool-Kategorien" : "Tool categories"}
      >
        <button
          type="button"
          aria-pressed={category === "all"}
          onClick={() => setCategory("all")}
        >
          {locale === "de" ? "Alle" : "All"}
        </button>
        {categories.map((item) => (
          <button
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            key={item}
          >
            {getToolCategoryLabel(item, locale)}
          </button>
        ))}
      </div>
      <p className="catalog-count" aria-live="polite">
        {filtered.length}{" "}
        {filtered.length === 1 ? (locale === "de" ? "Tool" : "tool") : "Tools"}
      </p>
      <div className="catalog-list" aria-live="polite">
        {filtered.map((tool) => (
          <Link
            className="catalog-item"
            href={`/${locale}/tools/${tool.slug}`}
            key={tool.id}
          >
            <span className="catalog-item__icon">
              <ToolGlyph name={tool.icon} />
            </span>
            <span>
              <strong>{tool.name[locale]}</strong>
              <small>{tool.summary[locale]}</small>
            </span>
            <span className="catalog-item__category">
              {getToolCategoryLabel(tool.category, locale)}
            </span>
            <ArrowRight size={19} />
          </Link>
        ))}
        {!filtered.length && (
          <p className="empty-state">{messages.noResults}</p>
        )}
      </div>
    </div>
  );
}
