"use client";

import Link from "next/link";
import { ArrowRight, FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ToolGlyph } from "@/components/tools/tool-glyph";
import type { ArticleRecord, Locale, ToolRecord } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n/messages";

const categoryColors: Record<string, string> = {
  documents: "coral",
  formatters: "coral",
  encoders: "violet",
  generators: "green",
  converters: "blue",
  text: "amber",
  office: "green",
};

function categoryLabel(category: string, locale: Locale) {
  const labels: Record<string, Record<Locale, string>> = {
    documents: { en: "Documents", de: "Dokumente" },
    formatters: { en: "Formatters", de: "Formatierer" },
    encoders: { en: "Encoders", de: "Kodierer" },
    generators: { en: "Generators", de: "Generatoren" },
    converters: { en: "Converters", de: "Konverter" },
    text: { en: "Text", de: "Text" },
    office: { en: "Office", de: "Office" },
  };
  return labels[category]?.[locale] ?? category;
}

function ToolCard({
  locale,
  tool,
  compact = false,
}: {
  locale: Locale;
  tool: ToolRecord;
  compact?: boolean;
}) {
  const tone = categoryColors[tool.category] ?? "blue";
  return (
    <Link
      className={`utility-card ${compact ? "utility-card--compact" : ""}`}
      href={`/${locale}/tools/${tool.slug}`}
    >
      <span className={`tool-icon tool-icon--${tone}`}>
        <ToolGlyph name={tool.icon} size={compact ? 20 : 24} />
      </span>
      <span className="utility-card__copy">
        <strong>{tool.name[locale]}</strong>
        <small>{tool.summary[locale]}</small>
      </span>
      <ArrowRight
        className="utility-card__arrow"
        aria-hidden="true"
        size={18}
      />
    </Link>
  );
}

export function UtilityHome({
  locale,
  tools,
  articles,
}: {
  locale: Locale;
  tools: ToolRecord[];
  articles: ArticleRecord[];
}) {
  const {
    home,
    tools: toolMessages,
    articles: articleMessages,
  } = getMessages(locale);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"usage" | "name">("usage");
  const categories = useMemo(
    () => [...new Set(tools.map((tool) => tool.category))],
    [tools],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return tools.filter((tool) => {
      const matchesCategory = category === "all" || tool.category === category;
      const haystack =
        `${tool.name[locale]} ${tool.summary[locale]} ${tool.category}`.toLocaleLowerCase(
          locale,
        );
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [category, locale, query, tools]);
  const visible = useMemo(
    () =>
      sort === "name"
        ? [...filtered].sort((a, b) =>
            a.name[locale].localeCompare(b.name[locale], locale),
          )
        : filtered,
    [filtered, locale, sort],
  );
  const featured = tools
    .filter(
      (tool) => tool.category !== "documents" && tool.category !== "office",
    )
    .slice(0, 6);
  const pdfTools = tools
    .filter((tool) => tool.category === "documents")
    .slice(0, 2);
  const officeTools = tools.filter((tool) => tool.category === "office");
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="utility-home">
      <section className="utility-hero site-shell" aria-labelledby="home-title">
        <h1 id="home-title">
          {locale === "de"
            ? "Developer-Tools für fokussiertes Arbeiten"
            : "Developer tools for focused work"}
        </h1>
        <p>
          {locale === "de"
            ? "Schnelle, datenschutzfreundliche Browser-Tools von Florian Cullmann — entwickelt für eine Aufgabe, ohne unnötige Umwege."
            : "Fast, privacy-conscious browser tools by Florian Cullmann — each built to finish one job without getting in the way."}
        </p>
        <label className="utility-search">
          <Search aria-hidden="true" size={21} />
          <span className="sr-only">{toolMessages.search}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              locale === "de"
                ? "Welches Tool suchst du?"
                : "What do you need to do?"
            }
          />
          {!query && <kbd aria-hidden="true">/</kbd>}
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={locale === "de" ? "Suche leeren" : "Clear search"}
            >
              <X size={17} />
            </button>
          )}
        </label>
        <div
          className="category-filters"
          aria-label={locale === "de" ? "Tool-Kategorien" : "Tool categories"}
        >
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            {locale === "de" ? "Alle Tools" : "All tools"}
          </button>
          {categories.map((item) => (
            <button
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              key={item}
            >
              {categoryLabel(item, locale)}
            </button>
          ))}
        </div>
      </section>

      <div className="site-shell utility-content">
        {!query && category === "all" && (
          <section
            className="utility-section"
            aria-labelledby="featured-tools-title"
          >
            <div className="section-heading">
              <div>
                <h2 id="featured-tools-title">{home.featured}</h2>
                <p>
                  {locale === "de"
                    ? "Die am häufigsten genutzten Werkzeuge, nach Nutzung sortiert."
                    : "The most-used utilities, ordered by real usage."}
                </p>
              </div>
              <Link href={`/${locale}/tools`}>
                {home.viewTools}
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="featured-grid">
              {featured.map((tool) => (
                <ToolCard key={tool.id} locale={locale} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {!query && category === "all" && pdfTools.length > 0 && (
          <section
            className="utility-section utility-section--pdf"
            aria-labelledby="pdf-tools-title"
          >
            <div className="section-heading">
              <div>
                <h2 id="pdf-tools-title">PDF Tools</h2>
                <p>
                  {locale === "de"
                    ? "PDF-Dateien direkt im Browser bearbeiten, ohne Upload."
                    : "Work with PDF files directly in your browser, without uploads."}
                </p>
              </div>
            </div>
            <div className="pdf-tools-grid">
              {pdfTools.map((tool) => (
                <ToolCard key={tool.id} locale={locale} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {!query && category === "all" && officeTools.length > 0 && (
          <section
            className="utility-section utility-section--office"
            aria-labelledby="office-tools-title"
          >
            <div className="section-heading">
              <div>
                <h2 id="office-tools-title">Office Tools</h2>
                <p>
                  {locale === "de"
                    ? "Excel-Dateien direkt im Browser konvertieren, ohne Upload."
                    : "Convert Excel files directly in your browser, without uploads."}
                </p>
              </div>
            </div>
            <div className="office-tools-grid">
              {officeTools.map((tool) => (
                <ToolCard key={tool.id} locale={locale} tool={tool} />
              ))}
            </div>
          </section>
        )}

        <section
          className="utility-section utility-section--catalog"
          aria-labelledby="all-tools-title"
        >
          <div className="section-heading">
            <div>
              <h2 id="all-tools-title">
                {locale === "de" ? "Alle Tools" : "All tools"}
              </h2>
              <p aria-live="polite">
                {visible.length}{" "}
                {visible.length === 1
                  ? locale === "de"
                    ? "Tool"
                    : "tool"
                  : "Tools"}
              </p>
            </div>
            <label className="utility-sort">
              <span>{locale === "de" ? "Sortieren" : "Sort"}</span>
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as "usage" | "name")
                }
              >
                <option value="usage">
                  {locale === "de" ? "Meistgenutzt" : "Most used"}
                </option>
                <option value="name">A–Z</option>
              </select>
            </label>
          </div>
          <div className="all-tools-grid">
            {visible.map((tool) => (
              <ToolCard key={tool.id} locale={locale} tool={tool} compact />
            ))}
          </div>
          {!visible.length && (
            <div className="empty-state">
              <Search size={24} />
              <strong>{toolMessages.noResults}</strong>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                {locale === "de" ? "Filter zurücksetzen" : "Reset filters"}
              </button>
            </div>
          )}
        </section>

        {!query && category === "all" && articles.length > 0 && (
          <section
            className="utility-section latest-writing"
            aria-labelledby="latest-writing-title"
          >
            <div className="section-heading">
              <div>
                <h2 id="latest-writing-title">{home.latest}</h2>
                <p>
                  {locale === "de"
                    ? "Praktische Notizen über Software und Developer Experience."
                    : "Practical notes on software and developer experience."}
                </p>
              </div>
              <Link href={`/${locale}/articles`}>
                {home.viewArticles}
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="writing-list">
              {articles.slice(0, 3).map((article) => (
                <Link
                  href={`/${locale}/articles/${article.slug}`}
                  key={article.id}
                >
                  <span className="writing-icon">
                    <FileText size={19} />
                  </span>
                  <span>
                    <strong>{article.title[locale]}</strong>
                    <small>{article.excerpt[locale]}</small>
                  </span>
                  <time dateTime={article.publishedAt.toISOString()}>
                    {formatter.format(article.publishedAt)}
                  </time>
                  {article.isDemo && <em>{articleMessages.sample}</em>}
                  <ArrowRight size={17} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
