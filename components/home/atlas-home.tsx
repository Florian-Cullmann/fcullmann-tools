import Link from "next/link";
import { ArrowRight, BookOpen, Boxes, CircleDot, FolderCode } from "lucide-react";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { ToolGlyph } from "@/components/tools/tool-glyph";
import type { ArticleRecord, Locale, ToolRecord } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n/messages";

function AtlasLegend({ locale }: { locale: Locale }) {
  const { home } = getMessages(locale);
  const entries = [
    ["route-dot--primary", home.legendTools],
    ["route-dot--secondary", home.legendProjects],
    ["route-dot--dashed", home.legendWriting]
  ];

  return (
    <aside className="atlas-identity">
      <p className="coordinate-label">N 48° 08′ · 11° 35′ E</p>
      <h1>{home.title}</h1>
      <p className="atlas-identity__role">{home.role}</p>
      <p className="atlas-identity__statement">{home.statement}</p>
      <p className="atlas-identity__intro">{home.intro}</p>
      <div className="atlas-legend" aria-label={home.legend}>
        <h2>{home.legend}</h2>
        {entries.map(([className, text], index) => (
          <div key={text} className="atlas-legend__item">
            <span className={`route-dot ${className}`}>{index + 1}</span>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className="scale-mark" aria-hidden="true">
        <span>0</span><span>50</span><span>100</span><span>150m</span>
      </div>
    </aside>
  );
}

function FeaturedTools({ locale, tools }: { locale: Locale; tools: ToolRecord[] }) {
  const { home } = getMessages(locale);
  return (
    <section className="atlas-list atlas-list--tools" aria-labelledby="featured-tools-title">
      <div className="atlas-list__heading">
        <h2 id="featured-tools-title">{home.featured}</h2>
        <Link href={`/${locale}/tools`}>{home.viewTools}<ArrowRight size={16} /></Link>
      </div>
      <div className="atlas-list__rows">
        {tools.map((tool, index) => (
          <Link key={tool.id} className="atlas-row" href={`/${locale}/tools/${tool.slug}`}>
            <span className="atlas-row__index">{String(index + 1).padStart(2, "0")}</span>
            <span className="atlas-row__glyph"><ToolGlyph name={tool.icon} size={22} /></span>
            <span className="atlas-row__body"><strong>{tool.name[locale]}</strong><small>{tool.summary[locale]}</small></span>
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}

function LatestWriting({ locale, articles }: { locale: Locale; articles: ArticleRecord[] }) {
  const { home, articles: articleMessages } = getMessages(locale);
  const formatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" });
  return (
    <section className="atlas-list atlas-list--writing" aria-labelledby="latest-writing-title">
      <div className="atlas-list__heading">
        <h2 id="latest-writing-title">{home.latest}</h2>
        <Link href={`/${locale}/articles`}>{home.viewArticles}<ArrowRight size={16} /></Link>
      </div>
      <div className="atlas-list__rows">
        {articles.slice(0, 2).map((article) => (
          <Link key={article.id} className="article-row" href={`/${locale}/articles/${article.slug}`}>
            <time dateTime={article.publishedAt.toISOString()}>{formatter.format(article.publishedAt)}</time>
            <span><strong>{article.title[locale]}</strong><small>{article.excerpt[locale]}</small></span>
            {article.isDemo && <em>{articleMessages.sample}</em>}
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function AtlasHome({ locale, tools, articles }: { locale: Locale; tools: ToolRecord[]; articles: ArticleRecord[] }) {
  const { home } = getMessages(locale);
  return (
    <div className="atlas-home atlas-shell">
      <div className="coordinate-frame" aria-hidden="true"><span>47° 52′</span><span>ROUTE FC-01 · SCALE 1:10 000 (UI)</span><span>48° 08′</span></div>
      <div className="atlas-workbench">
        <AtlasLegend locale={locale} />
        <div className="atlas-tool-destination">
          <div className="destination-label"><CircleDot size={20} /><span>02</span><p>{home.route}</p></div>
          <JsonFormatter locale={locale} compact />
        </div>
      </div>
      <div className="atlas-route-divider" aria-hidden="true"><span>01</span><i /><span>02</span><i /><span>03</span></div>
      <div className="atlas-lower-grid">
        <FeaturedTools locale={locale} tools={tools} />
        <LatestWriting locale={locale} articles={articles} />
      </div>
      <section className="home-route-close">
        <div><Boxes size={24} /><h2>{locale === "de" ? "Eine wachsende Werkzeugkarte" : "A growing map of useful tools"}</h2><p>{locale === "de" ? "Jedes Tool erhält eine eigene Route, klare Metadaten und eine Oberfläche für genau eine Aufgabe." : "Each tool gets its own route, clear metadata, and an interface built around one finished job."}</p><Link href={`/${locale}/tools`}>{home.viewTools}<ArrowRight size={17} /></Link></div>
        <div><FolderCode size={24} /><h2>{locale === "de" ? "Arbeit mit nachvollziehbarem Kontext" : "Work with traceable context"}</h2><p>{locale === "de" ? "Projekte werden erst veröffentlicht, wenn Umfang, Rolle und Quellen verifiziert sind." : "Projects publish only when scope, role, and source links are verified."}</p><Link href={`/${locale}/projects`}>{locale === "de" ? "Projekte ansehen" : "View projects"}<ArrowRight size={17} /></Link></div>
        <div><BookOpen size={24} /><h2>{locale === "de" ? "Notizen aus der Praxis" : "Notes from the field"}</h2><p>{locale === "de" ? "Technische Artikel erklären Entscheidungen, Grenzen und Muster ohne Marketingnebel." : "Technical articles explain decisions, constraints, and patterns without marketing fog."}</p><Link href={`/${locale}/articles`}>{home.viewArticles}<ArrowRight size={17} /></Link></div>
      </section>
    </div>
  );
}
