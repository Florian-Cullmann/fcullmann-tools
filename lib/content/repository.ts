import { cache } from "react";
import { demoArticles, demoProjects, demoTools } from "@/lib/content/demo";
import type {
  ArticleRecord,
  ProjectRecord,
  ToolRecord,
} from "@/lib/content/types";
import { getDb } from "@/lib/db";

const canQueryDatabase = () => Boolean(process.env.DATABASE_URL);

function mapTool(tool: {
  id: string;
  slug: string;
  nameEn: string;
  nameDe: string;
  summaryEn: string;
  summaryDe: string;
  descriptionEn: string;
  descriptionDe: string;
  category: string;
  icon: string;
  featured: boolean;
  sortOrder: number;
  usageCount: bigint;
}): ToolRecord {
  return {
    id: tool.id,
    slug: tool.slug,
    name: { en: tool.nameEn, de: tool.nameDe },
    summary: { en: tool.summaryEn, de: tool.summaryDe },
    description: { en: tool.descriptionEn, de: tool.descriptionDe },
    category: tool.category,
    icon: tool.icon,
    featured: tool.featured,
    sortOrder: tool.sortOrder,
    usageCount: Number(tool.usageCount),
  };
}

export const getTools = cache(async (): Promise<ToolRecord[]> => {
  if (!canQueryDatabase()) return demoTools;

  const tools = await getDb().tool.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ usageCount: "desc" }, { sortOrder: "asc" }, { nameEn: "asc" }],
  });

  return tools.map(mapTool);
});

export const getFeaturedTools = cache(
  async (limit = 3): Promise<ToolRecord[]> => {
    const tools = await getTools();
    return tools.filter((tool) => tool.featured).slice(0, limit);
  },
);

export const getTool = cache(
  async (slug: string): Promise<ToolRecord | null> => {
    const tools = await getTools();
    return tools.find((tool) => tool.slug === slug) ?? null;
  },
);

export const getArticles = cache(async (): Promise<ArticleRecord[]> => {
  if (!canQueryDatabase()) return demoArticles;

  const now = new Date();
  const articles = await getDb().article.findMany({
    where: {
      OR: [
        { status: "PUBLISHED", publishedAt: { lte: now } },
        { status: "SCHEDULED", publishedAt: { lte: now } },
      ],
    },
    orderBy: { publishedAt: "desc" },
  });

  return articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: { en: article.titleEn, de: article.titleDe },
    excerpt: { en: article.excerptEn, de: article.excerptDe },
    content: { en: article.contentEn, de: article.contentDe },
    seoTitle: {
      en: article.seoTitleEn ?? undefined,
      de: article.seoTitleDe ?? undefined,
    },
    seoDescription: {
      en: article.seoDescriptionEn ?? undefined,
      de: article.seoDescriptionDe ?? undefined,
    },
    publishedAt: article.publishedAt ?? article.createdAt,
  }));
});

export const getArticle = cache(
  async (slug: string): Promise<ArticleRecord | null> => {
    const articles = await getArticles();
    return articles.find((article) => article.slug === slug) ?? null;
  },
);

export const getProjects = cache(async (): Promise<ProjectRecord[]> => {
  if (!canQueryDatabase()) return demoProjects;

  const projects = await getDb().project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
  });

  return projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: { en: project.summaryEn, de: project.summaryDe },
    description: { en: project.descriptionEn, de: project.descriptionDe },
    technologies: project.technologies,
    url: project.url ?? undefined,
    repositoryUrl: project.repositoryUrl ?? undefined,
  }));
});
