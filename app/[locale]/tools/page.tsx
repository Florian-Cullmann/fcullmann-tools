import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolCatalog } from "@/components/tools/tool-catalog";
import { getTools } from "@/lib/content/repository";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tools">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Developer-Tools" : "Developer Tools",
    description:
      locale === "de"
        ? "Schnelle, datenschutzfreundliche Tools für alltägliche Entwickleraufgaben."
        : "Fast, privacy-conscious tools for everyday developer tasks.",
    alternates: isLocale(locale)
      ? localizedAlternates(locale, "tools")
      : undefined,
  };
}

export default async function ToolsPage({
  params,
}: PageProps<"/[locale]/tools">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const tools = await getTools();
  const messages = getMessages(locale).tools;
  return (
    <div className="content-page site-shell">
      <header className="page-heading">
        <h1>{messages.title}</h1>
        <p>{messages.intro}</p>
      </header>
      <ToolCatalog locale={locale} tools={tools} />
      <section className="tool-roadmap" aria-labelledby="roadmap-title">
        <div>
          <h2 id="roadmap-title">PDF Converter</h2>
        </div>
        <p>
          {locale === "de"
            ? "Sichere PDF-Workflows folgen als eigene, klar abgegrenzte Werkzeuge. Dateiverarbeitung und Datenschutz werden vor der Veröffentlichung technisch verifiziert."
            : "Focused PDF workflows will follow as dedicated tools. File processing and privacy guarantees will be verified before release."}
        </p>
        <strong>{locale === "de" ? "In Planung" : "Planned"}</strong>
      </section>
    </div>
  );
}
