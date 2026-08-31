import type { MetadataRoute } from "next";
import { getArticles, getTools } from "@/lib/content/repository";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";
  const [tools, articles] = await Promise.all([getTools(), getArticles()]);
  const locales = ["en", "de"];
  const fixed = [
    "",
    "/tools",
    "/projects",
    "/articles",
    "/about",
    "/impressum",
    "/datenschutz",
  ];
  const alternates = (path: string) => ({
    languages: {
      en: `${baseUrl}/en${path}`,
      de: `${baseUrl}/de${path}`,
      "x-default": `${baseUrl}/en${path}`,
    },
  });
  return [
    ...locales.flatMap((locale) =>
      fixed.map((path) => ({
        url: `${baseUrl}/${locale}${path}`,
        alternates: alternates(path),
        changeFrequency:
          path === "" ? ("weekly" as const) : ("monthly" as const),
        priority: path === "" ? 1 : 0.7,
      })),
    ),
    ...locales.flatMap((locale) =>
      tools.map((tool) => ({
        url: `${baseUrl}/${locale}/tools/${tool.slug}`,
        alternates: alternates(`/tools/${tool.slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ),
    ...locales.flatMap((locale) =>
      articles.map((article) => ({
        url: `${baseUrl}/${locale}/articles/${article.slug}`,
        alternates: alternates(`/articles/${article.slug}`),
        lastModified: article.publishedAt,
        changeFrequency: "yearly" as const,
        priority: 0.6,
      })),
    ),
  ];
}
