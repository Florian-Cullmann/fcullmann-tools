import { getArticles, getTools } from "@/lib/content/repository";

export const revalidate = 60;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";
  const [tools, articles] = await Promise.all([getTools(), getArticles()]);
  const lines = [
    "# Florian Cullmann",
    "",
    "> Personal website of senior software engineer Florian Cullmann, featuring browser-based developer tools, selected projects, and technical field notes.",
    "",
    "## Developer tools",
    ...tools.map(
      (tool) =>
        `- [${tool.name.en}](${siteUrl}/en/tools/${tool.slug}): ${tool.summary.en}`,
    ),
    "",
    "## Writing",
    ...articles.map(
      (article) =>
        `- [${article.title.en}](${siteUrl}/en/articles/${article.slug}): ${article.excerpt.en}`,
    ),
    "",
    "## Localized routes",
    `- [English](${siteUrl}/en)`,
    `- [Deutsch](${siteUrl}/de)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
