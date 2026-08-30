import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import {
  Base64Tool,
  CaseConverterTool,
  ColorConverterTool,
  HashGeneratorTool,
  SlugGeneratorTool,
  TimestampConverterTool,
  UrlCodecTool,
  UuidTool,
  WordCounterTool,
} from "@/components/tools/simple-tools";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { getTool, getTools } from "@/lib/content/repository";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { jsonLd, localizedAlternates } from "@/lib/seo";

export async function generateStaticParams() {
  const tools = await getTools();
  return ["en", "de"].flatMap((locale) =>
    tools.map((tool) => ({ locale, slug: tool.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tools/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const tool = await getTool(slug);
  if (!tool) return {};
  return {
    title: tool.name[locale],
    description: tool.description[locale],
    alternates: localizedAlternates(locale, `tools/${slug}`),
  };
}

export default async function ToolPage({
  params,
}: PageProps<"/[locale]/tools/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const tool = await getTool(slug);
  if (!tool) notFound();
  const messages = getMessages(locale).tools;
  const workspace =
    slug === "json-formatter" ? (
      <JsonFormatter locale={locale} />
    ) : slug === "base64" ? (
      <Base64Tool locale={locale} />
    ) : slug === "uuid-generator" ? (
      <UuidTool locale={locale} />
    ) : slug === "url-encoder" ? (
      <UrlCodecTool locale={locale} />
    ) : slug === "hash-generator" ? (
      <HashGeneratorTool locale={locale} />
    ) : slug === "timestamp-converter" ? (
      <TimestampConverterTool locale={locale} />
    ) : slug === "case-converter" ? (
      <CaseConverterTool locale={locale} />
    ) : slug === "color-converter" ? (
      <ColorConverterTool locale={locale} />
    ) : slug === "word-counter" ? (
      <WordCounterTool locale={locale} />
    ) : slug === "slug-generator" ? (
      <SlugGeneratorTool locale={locale} />
    ) : null;
  if (!workspace) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name[locale],
    description: tool.description[locale],
    url: `${siteUrl}/${locale}/tools/${slug}`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    author: { "@type": "Person", name: "Florian Cullmann" },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(structuredData)}
      />
      <div className="tool-page site-shell">
        <Link className="back-link" href={`/${locale}/tools`}>
          <ArrowLeft size={16} />
          {messages.title}
        </Link>
        <header className="tool-page__heading">
          <div>
            <p className="tool-category">{tool.category}</p>
            <h1>{tool.name[locale]}</h1>
            <p>{tool.description[locale]}</p>
          </div>
          <span className="privacy-note">
            <LockKeyhole size={18} />
            {messages.privacy}
          </span>
        </header>
        {workspace}
      </div>
    </>
  );
}
