import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getArticles } from "@/lib/content/repository";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/articles">): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "de" ? "Artikel" : "Field Notes", description: locale === "de" ? "Technische Artikel über Softwarearchitektur und Developer Experience." : "Practical writing about software architecture and developer experience.", alternates: isLocale(locale) ? localizedAlternates(locale, "articles") : undefined };
}

export default async function ArticlesPage({ params }: PageProps<"/[locale]/articles">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const articles = await getArticles();
  const messages = getMessages(locale).articles;
  const date = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" });

  return <div className="content-page atlas-shell"><header className="page-heading"><p className="coordinate-label">ROUTE W · EDITORIAL FIELD NOTES</p><h1>{messages.title}</h1><p>{messages.intro}</p></header><div className="article-index">{articles.map((article, index) => <Link className="article-index__item" key={article.id} href={`/${locale}/articles/${article.slug}`}><span className="article-index__number">W-{String(index + 1).padStart(3, "0")}</span><time>{date.format(article.publishedAt)}</time><div><h2>{article.title[locale]}</h2><p>{article.excerpt[locale]}</p>{article.isDemo && <em>{messages.sample}</em>}</div><ArrowRight size={20} /></Link>)}</div></div>;
}
