import type { MetadataRoute } from "next";
import { getTools } from "@/lib/content/repository";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tools.fcullmann.com";
  const tools = await getTools();
  const locales = ["en", "de"];
  const fixed = [
    "",
    "/tools",
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
  ];
}
