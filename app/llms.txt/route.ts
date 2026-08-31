import { getArticles, getTools } from "@/lib/content/repository";

export const revalidate = 60;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";
  const [tools, articles] = await Promise.all([getTools(), getArticles()]);
  const lines = [
    "# fcullmann.com",
    "",
    "> Personal website of senior software engineer Florian Cullmann, featuring browser-based developer tools, selected projects, and technical field notes.",
    "",
    "The tools run locally in the browser where possible. Files selected in the PDF and Office tools are not uploaded to the application server.",
    "",
    "## Primary pages",
    `- [English home](${siteUrl}/en): Developer tools, projects, and engineering notes.`,
    `- [German home](${siteUrl}/de): Developer-Tools, Projekte und technische Artikel.`,
    `- [Developer tools](${siteUrl}/en/tools): Complete English tool catalogue.`,
    `- [Developer-Tools](${siteUrl}/de/tools): Vollständiger deutscher Tool-Katalog.`,
    `- [Projects](${siteUrl}/en/projects): Selected software projects.`,
    `- [About Florian Cullmann](${siteUrl}/en/about): Author and site context.`,
    "",
    "## Developer tools — English",
    ...tools.map(
      (tool) =>
        `- [${tool.name.en}](${siteUrl}/en/tools/${tool.slug}): ${tool.summary.en}`,
    ),
    "",
    "## Developer-Tools — Deutsch",
    ...tools.map(
      (tool) =>
        `- [${tool.name.de}](${siteUrl}/de/tools/${tool.slug}): ${tool.summary.de}`,
    ),
    "",
    "## Writing — English",
    ...articles.map(
      (article) =>
        `- [${article.title.en}](${siteUrl}/en/articles/${article.slug}): ${article.excerpt.en}`,
    ),
    "",
    "## Artikel — Deutsch",
    ...articles.map(
      (article) =>
        `- [${article.title.de}](${siteUrl}/de/articles/${article.slug}): ${article.excerpt.de}`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
