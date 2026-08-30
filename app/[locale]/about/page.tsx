import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Über Florian Cullmann" : "About Florian Cullmann",
    description:
      locale === "de"
        ? "Über Florian Cullmann und seine Arbeit an Softwareprojekten und Developer-Tools."
        : "About Florian Cullmann and his work on software projects and developer tools.",
    alternates: isLocale(locale)
      ? localizedAlternates(locale, "about")
      : undefined,
  };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale).about;
  return (
    <div className="about-page site-shell">
      <article>
        <h1>{messages.title}</h1>
        <p>{messages.body}</p>
        <aside>{messages.note}</aside>
      </article>
      <dl>
        <div>
          <dt>{locale === "de" ? "Fokus" : "Focus"}</dt>
          <dd>Developer tools · reliable systems · interface clarity</dd>
        </div>
        <div>
          <dt>{locale === "de" ? "Standort" : "Base"}</dt>
          <dd>{locale === "de" ? "Noch zu ergänzen" : "To be confirmed"}</dd>
        </div>
        <div>
          <dt>{locale === "de" ? "Kontakt" : "Contact"}</dt>
          <dd>
            {locale === "de"
              ? "Vor dem Launch ergänzen"
              : "To be added before launch"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
