import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AtlasHome } from "@/components/home/atlas-home";
import { getArticles, getFeaturedTools } from "@/lib/content/repository";
import { isLocale } from "@/lib/i18n/config";
import { jsonLd, localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Florian Ullmann — Softwareentwicklung & Developer-Tools" : "Florian Ullmann — Software Engineer & Developer Tools",
    description: locale === "de" ? "Fokussierte Browser-Tools, ausgewählte Softwareprojekte und technische Artikel von Florian Ullmann." : "Focused browser tools, selected software projects, and practical engineering notes by Florian Ullmann.",
    alternates: isLocale(locale) ? localizedAlternates(locale) : undefined
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [tools, articles] = await Promise.all([getFeaturedTools(3), getArticles()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Florian Ullmann",
    url: siteUrl,
    jobTitle: "Senior Software Engineer",
    knowsAbout: ["Software Engineering", "Developer Tools", "Web Development"]
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} /><AtlasHome locale={locale} tools={tools} articles={articles} /></>;
}
