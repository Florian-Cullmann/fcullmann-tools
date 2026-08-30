import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleDot } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "de" ? "Über Florian Ullmann" : "About Florian Ullmann", description: locale === "de" ? "Über Florian Ullmann und seine Arbeit als Software Engineer." : "About Florian Ullmann and his work as a software engineer.", alternates: isLocale(locale) ? localizedAlternates(locale, "about") : undefined };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale).about;
  return <div className="about-page atlas-shell"><div className="about-page__route"><CircleDot /><span>ABOUT · POSITION 48.13 / 11.58</span></div><article><h1>{messages.title}</h1><p>{messages.body}</p><aside>{messages.note}</aside></article><dl><div><dt>{locale === "de" ? "Fokus" : "Focus"}</dt><dd>Developer tools · reliable systems · interface clarity</dd></div><div><dt>{locale === "de" ? "Standort" : "Base"}</dt><dd>{locale === "de" ? "Noch zu ergänzen" : "To be confirmed"}</dd></div><div><dt>{locale === "de" ? "Kontakt" : "Contact"}</dt><dd>{locale === "de" ? "Vor dem Launch ergänzen" : "To be added before launch"}</dd></div></dl></div>;
}
