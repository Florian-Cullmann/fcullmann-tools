import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
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
  return (
    <div className="about-page site-shell">
      <section className="about-intro" aria-labelledby="about-title">
        <div className="about-intro__copy">
          <h1 id="about-title">
            {locale === "de" ? "Hi, ich bin Florian." : "Hi, I'm Florian."}
          </h1>
          <p>
            {locale === "de"
              ? "Ich entwickle verlässliche Systeme, klare Oberflächen und Developer-Tools für konkrete Probleme."
              : "I build dependable systems, clear interfaces, and developer tools for concrete problems."}
          </p>
          <p>
            {locale === "de"
              ? "Auf dieser Website sammle ich kleine Browser-Werkzeuge, ausgewählte Projekte und Notizen aus meiner Arbeit an Software."
              : "This website is where I collect small browser utilities, selected projects, and notes from my work in software."}
          </p>
        </div>
        <figure className="about-portrait">
          <Image
            src="/images/florian-cullmann.webp"
            alt={
              locale === "de"
                ? "Porträt von Florian Cullmann"
                : "Portrait of Florian Cullmann"
            }
            width={720}
            height={720}
            priority
            sizes="(max-width: 760px) 70vw, 320px"
          />
        </figure>
      </section>

      <div className="about-details">
        <section className="about-story">
          <h2>{locale === "de" ? "Was ich hier baue" : "What I build here"}</h2>
          <p>
            {locale === "de"
              ? "Die Tools auf dieser Seite lösen jeweils eine konkrete Aufgabe. Sie sollen schnell verständlich sein, zuverlässig funktionieren und möglichst wenig im Weg stehen."
              : "Each tool on this site solves one concrete task. It should be quick to understand, dependable in use, and stay out of the way."}
          </p>
          <p>
            {locale === "de"
              ? "Projekte zeigen größere Zusammenhänge, während die Artikel Entscheidungen, Erfahrungen und technische Details festhalten. Zusammen ist das meine kleine öffentliche Software-Werkstatt."
              : "Projects show the larger context, while articles capture decisions, experience, and technical details. Together, they form my small public software workshop."}
          </p>
        </section>

        <section className="about-principles" aria-labelledby="principles-title">
          <h2 id="principles-title">
            {locale === "de" ? "Worauf es mir ankommt" : "What matters to me"}
          </h2>
          <dl>
            <div>
              <dt>{locale === "de" ? "Klarheit" : "Clarity"}</dt>
              <dd>
                {locale === "de"
                  ? "Oberflächen und Code sollen verständlich bleiben."
                  : "Interfaces and code should remain understandable."}
              </dd>
            </div>
            <div>
              <dt>{locale === "de" ? "Verlässlichkeit" : "Dependability"}</dt>
              <dd>
                {locale === "de"
                  ? "Software muss ihre alltägliche Aufgabe sicher erfüllen."
                  : "Software needs to handle its everyday job with confidence."}
              </dd>
            </div>
            <div>
              <dt>{locale === "de" ? "Fokus" : "Focus"}</dt>
              <dd>
                {locale === "de"
                  ? "Komplexität ist nur dann sinnvoll, wenn sie echten Nutzen bringt."
                  : "Complexity is only worthwhile when it delivers real value."}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <nav
        className="about-paths"
        aria-label={locale === "de" ? "Mehr entdecken" : "Explore more"}
      >
        {[
          [
            locale === "de" ? "Tools verwenden" : "Use the tools",
            locale === "de"
              ? "Kleine Helfer für konkrete Aufgaben"
              : "Small utilities for concrete tasks",
            `/${locale}/tools`,
          ],
          [
            locale === "de" ? "Projekte ansehen" : "View projects",
            locale === "de"
              ? "Ausgewählte Software und Experimente"
              : "Selected software and experiments",
            `/${locale}/projects`,
          ],
          [
            locale === "de" ? "Artikel lesen" : "Read the articles",
            locale === "de"
              ? "Notizen aus Entwicklung und Praxis"
              : "Notes from engineering and practice",
            `/${locale}/articles`,
          ],
        ].map(([title, description, href]) => (
          <Link href={href} key={href}>
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        ))}
      </nav>
    </div>
  );
}
