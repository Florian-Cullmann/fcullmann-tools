"use client";

import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ToolGlyph } from "@/components/tools/tool-glyph";
import type { ToolRecord } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/types";
import { getMessages } from "@/lib/i18n/messages";
import { getToolCategoryLabel } from "@/lib/tools/categories";

const categoryColors: Record<string, string> = {
  documents: "coral",
  formatters: "coral",
  encoders: "violet",
  generators: "green",
  converters: "blue",
  text: "amber",
  office: "green",
  images: "violet",
};

function ToolCard({
  locale,
  tool,
  compact = false,
}: {
  locale: Locale;
  tool: ToolRecord;
  compact?: boolean;
}) {
  const tone =
    tool.icon === "word-pdf"
      ? "blue"
      : (categoryColors[tool.category] ?? "blue");
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
}: {
  locale: Locale;
  tools: ToolRecord[];
}) {
  const { home, tools: toolMessages } = getMessages(locale);
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
      (tool) =>
        tool.category !== "documents" &&
        tool.category !== "office" &&
        tool.category !== "images",
    )
    .slice(0, 6);
  const pdfTools = tools
    .filter((tool) => tool.category === "documents")
    .slice(0, 8);
  const officeTools = tools.filter((tool) => tool.category === "office");
  const imageTools = tools.filter((tool) => tool.category === "images");

  return (
    <div className="utility-home">
      <section className="utility-hero site-shell" aria-labelledby="home-title">
        <div className="utility-hero__panel">
          <div className="utility-hero__intro">
            <div className="utility-hero__copy">
              <h1 id="home-title">
                <span>fcuTools.</span>{" "}
                {locale === "de"
                  ? "Praktische Tools für den Alltag."
                  : "Practical tools for everyday tasks."}
              </h1>
              <p>
                {locale === "de"
                  ? "PDFs bearbeiten, Bilder konvertieren, Daten formatieren: Finde das passende Tool und erledige deine Aufgaben direkt im Browser."
                  : "Edit PDFs, convert images, and format data: Find the right tool and get things done directly in your browser."}
              </p>
              <div className="utility-hero__actions">
                <Link href={`/${locale}/tools`}>
                  {locale === "de" ? "Alle Tools entdecken" : "Explore all tools"}
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
                <Link href="#all-tools-title">
                  {locale === "de"
                    ? "Tool-Katalog durchsuchen"
                    : "Browse the tool catalogue"}
                </Link>
              </div>
            </div>
          </div>

          <div className="utility-toolbox">
            <div className="utility-toolbox__heading">
              <strong>
                {locale === "de" ? "Das passende Tool finden" : "Find the right tool"}
              </strong>
              <span>
                {locale === "de"
                  ? `${tools.length} kleine Helfer, direkt im Browser.`
                  : `${tools.length} small utilities, ready in your browser.`}
              </span>
            </div>
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
                  aria-label={
                    locale === "de" ? "Suche leeren" : "Clear search"
                  }
                >
                  <X size={17} />
                </button>
              )}
            </label>
            <div
              className="category-filters"
              aria-label={
                locale === "de" ? "Tool-Kategorien" : "Tool categories"
              }
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
                  {getToolCategoryLabel(item, locale)}
                </button>
              ))}
            </div>
          </div>
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
                    ? "Office-Dateien direkt im Browser konvertieren, ohne Upload."
                    : "Convert Office files directly in your browser, without uploads."}
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

        {!query && category === "all" && imageTools.length > 0 && (
          <section
            className="utility-section utility-section--images"
            aria-labelledby="image-tools-title"
          >
            <div className="section-heading">
              <div>
                <h2 id="image-tools-title">
                  {locale === "de" ? "Bild-Tools" : "Image tools"}
                </h2>
                <p>
                  {locale === "de"
                    ? "Bildformate direkt im Browser konvertieren, ohne Upload."
                    : "Convert image formats directly in your browser, without uploads."}
                </p>
              </div>
            </div>
            <div className="image-tools-grid">
              {imageTools.map((tool) => (
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

      </div>
    </div>
  );
}
