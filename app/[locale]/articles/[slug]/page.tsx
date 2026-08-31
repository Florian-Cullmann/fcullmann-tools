import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticle, getArticles } from "@/lib/content/repository";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { jsonLd, localizedAlternates } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getArticles();
  return ["en", "de"].flatMap((locale) =>
    articles.map((article) => ({ locale, slug: article.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/articles/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = await getArticle(slug);
  if (!article) return {};
  const title = article.seoTitle?.[locale] ?? article.title[locale];
  const description =
    article.seoDescription?.[locale] ?? article.excerpt[locale];
  const path = `/${locale}/articles/${slug}`;
  const socialImage = {
    url: `/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: "Florian Cullmann — developer tools and software projects",
  };
  return {
    title,
    description,
    alternates: localizedAlternates(locale, `articles/${slug}`),
    openGraph: {
      type: "article",
      title,
      description,
      url: path,
      locale: locale === "de" ? "de_DE" : "en_US",
      publishedTime: article.publishedAt.toISOString(),
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/[locale]/articles/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = await getArticle(slug);
  if (!article) notFound();
  const messages = getMessages(locale).articles;
  const date = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title[locale],
    description: article.seoDescription?.[locale] ?? article.excerpt[locale],
    datePublished: article.publishedAt.toISOString(),
    inLanguage: locale,
    mainEntityOfPage: `${siteUrl}/${locale}/articles/${slug}`,
    author: { "@type": "Person", name: "Florian Cullmann", url: siteUrl },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(structuredData)}
      />
      <div className="reading-page site-shell">
        <Link className="back-link" href={`/${locale}/articles`}>
          <ArrowLeft size={16} />
          {messages.title}
        </Link>
        <article>
          <header>
            <p className="article-date">{date.format(article.publishedAt)}</p>
            <h1>{article.title[locale]}</h1>
            <p>{article.excerpt[locale]}</p>
            {article.isDemo && (
              <span className="sample-badge">{messages.sample}</span>
            )}
          </header>
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content[locale]}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </>
  );
}
