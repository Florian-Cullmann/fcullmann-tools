import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UtilityHome } from "@/components/home/utility-home";
import { getArticles, getTools } from "@/lib/content/repository";
import { isLocale } from "@/lib/i18n/config";
import { jsonLd, localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "de"
        ? "Florian Cullmann — Softwareprojekte & Developer-Tools"
        : "Florian Cullmann — Developer Tools & Software Projects",
    description:
      locale === "de"
        ? "Fokussierte Browser-Tools, ausgewählte Softwareprojekte und technische Artikel von Florian Cullmann."
        : "Focused browser tools, selected software projects, and practical engineering notes by Florian Cullmann.",
    alternates: isLocale(locale) ? localizedAlternates(locale) : undefined,
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [tools, articles] = await Promise.all([getTools(), getArticles()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Florian Cullmann",
    url: siteUrl,
    knowsAbout: ["Software Engineering", "Developer Tools", "Web Development"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(structuredData)}
      />
      <UtilityHome locale={locale} tools={tools} articles={articles} />
    </>
  );
}
