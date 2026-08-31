import type { Locale } from "@/lib/i18n/types";

export type ToolRecord = {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  summary: Record<Locale, string>;
  description: Record<Locale, string>;
  category: string;
  icon: string;
  featured: boolean;
  sortOrder: number;
  usageCount: number;
  isDemo?: boolean;
};

export type ArticleRecord = {
  id: string;
  slug: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string>;
  seoTitle?: Partial<Record<Locale, string>>;
  seoDescription?: Partial<Record<Locale, string>>;
  publishedAt: Date;
  isDemo?: boolean;
};

export type ProjectRecord = {
  id: string;
  slug: string;
  title: string;
  summary: Record<Locale, string>;
  description: Record<Locale, string>;
  technologies: string[];
  url?: string;
  repositoryUrl?: string;
  isDemo?: boolean;
};
