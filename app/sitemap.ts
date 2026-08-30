import type { MetadataRoute } from "next";
import { getArticles, getTools } from "@/lib/content/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fcullmann.com";
  const [tools, articles] = await Promise.all([getTools(), getArticles()]);
  const locales = ["en", "de"];
  const fixed = ["", "/tools", "/projects", "/articles", "/about"];
  return [
    ...locales.flatMap((locale) => fixed.map((path) => ({ url: `${baseUrl}/${locale}${path}`, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.7 }))),
    ...locales.flatMap((locale) => tools.map((tool) => ({ url: `${baseUrl}/${locale}/tools/${tool.slug}`, changeFrequency: "monthly" as const, priority: 0.8 }))),
    ...locales.flatMap((locale) => articles.map((article) => ({ url: `${baseUrl}/${locale}/articles/${article.slug}`, lastModified: article.publishedAt, changeFrequency: "yearly" as const, priority: 0.6 })))
  ];
}
