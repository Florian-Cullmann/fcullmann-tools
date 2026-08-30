import type { Metadata } from "next";
import { CodeXml, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getProjects } from "@/lib/content/repository";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Projekte" : "Selected Work",
    description:
      locale === "de"
        ? "Ausgewählte Softwareprojekte von Florian Ullmann."
        : "Selected software projects by Florian Ullmann.",
    alternates: isLocale(locale)
      ? localizedAlternates(locale, "projects")
      : undefined,
  };
}

export default async function ProjectsPage({
  params,
}: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const projects = await getProjects();
  const messages = getMessages(locale).projects;
  return (
    <div className="content-page site-shell">
      <header className="page-heading">
        <h1>{messages.title}</h1>
        <p>{messages.intro}</p>
      </header>
      <div className="project-list">
        {projects.map((project) => (
          <article key={project.id} className="project-entry">
            <div>
              <h2>{project.title}</h2>
              <p>{project.description[locale]}</p>
              <ul>
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
            <div className="project-entry__links">
              {project.repositoryUrl && (
                <a href={project.repositoryUrl}>
                  <CodeXml size={17} />
                  Repository
                </a>
              )}
              {project.url && (
                <a href={project.url}>
                  <ExternalLink size={17} />
                  Live
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
