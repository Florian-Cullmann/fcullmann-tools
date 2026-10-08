import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UtilityHome } from "@/components/home/utility-home";
import { getTools } from "@/lib/content/repository";
import { isLocale } from "@/lib/i18n/config";
import { jsonLd, localizedAlternates } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      absolute: locale === "de"
        ? "fcuTools – Praktische Online-Tools für den Alltag"
        : "fcuTools – Practical online tools for everyday tasks",
    },
    description:
      locale === "de"
        ? "PDFs bearbeiten, Bilder und Office-Dateien konvertieren sowie Daten formatieren – mit fcuTools direkt im Browser."
        : "Edit PDFs, convert images and Office files, and format data with fcuTools directly in your browser.",
    alternates: isLocale(locale) ? localizedAlternates(locale) : undefined,
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const tools = await getTools();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tools.fcullmann.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "fcuTools",
        inLanguage: ["en", "de"],
        description: locale === "de"
          ? "Online-Tools für PDFs, Bilder, Office-Dateien und Daten."
          : "Online tools for PDFs, images, Office files, and data.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(structuredData)}
      />
      <UtilityHome locale={locale} tools={tools} />
    </>
  );
}
