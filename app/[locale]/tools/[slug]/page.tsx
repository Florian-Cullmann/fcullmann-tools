import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import {
  hasToolWorkspace,
  renderToolWorkspace,
} from "@/components/tools/registry";
import { getTool, getTools } from "@/lib/content/repository";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { jsonLd, localizedAlternates } from "@/lib/seo";

export async function generateStaticParams() {
  const tools = await getTools();
  return ["en", "de"].flatMap((locale) =>
    tools
      .filter((tool) => hasToolWorkspace(tool.slug))
      .map((tool) => ({ locale, slug: tool.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tools/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const tool = await getTool(slug);
  if (!tool) return {};
  const path = `/${locale}/tools/${slug}`;
  const socialImage = {
    url: `/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: "Florian Cullmann - developer tools and software projects",
  };
  return {
    title: tool.name[locale],
    description: tool.description[locale],
    alternates: localizedAlternates(locale, `tools/${slug}`),
    openGraph: {
      type: "website",
      title: tool.name[locale],
      description: tool.description[locale],
      url: path,
      locale: locale === "de" ? "de_DE" : "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.name[locale],
      description: tool.description[locale],
      images: [socialImage],
    },
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
  const workspace = renderToolWorkspace(slug, { locale });
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
            <h1>{tool.name[locale]}</h1>
            <p>{tool.description[locale]}</p>
          </div>
        </header>
        {workspace}
      </div>
    </>
  );
}
