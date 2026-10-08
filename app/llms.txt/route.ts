import { getTools } from "@/lib/content/repository";

export const revalidate = 60;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tools.fcullmann.com";
  const tools = await getTools();
  const lines = [
    "# fcuTools",
    "",
    "> fcuTools is a collection of browser-based tools for PDFs, images, Office files, text, and data.",
    "",
    "The tools run locally in the browser where possible. Files selected in the PDF and Office tools are not uploaded to the application server.",
    "",
    "## Primary pages",
    `- [English home](${siteUrl}/en): Practical online tools for everyday tasks.`,
    `- [German home](${siteUrl}/de): Praktische Online-Tools für den Alltag.`,
    `- [Developer tools](${siteUrl}/en/tools): Complete English tool catalogue.`,
    `- [Developer-Tools](${siteUrl}/de/tools): Vollständiger deutscher Tool-Katalog.`,
    "",
    "## Developer tools - English",
    ...tools.map(
      (tool) =>
        `- [${tool.name.en}](${siteUrl}/en/tools/${tool.slug}): ${tool.summary.en}`,
    ),
    "",
    "## Developer-Tools - Deutsch",
    ...tools.map(
      (tool) =>
        `- [${tool.name.de}](${siteUrl}/de/tools/${tool.slug}): ${tool.summary.de}`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
