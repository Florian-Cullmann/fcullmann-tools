import { z } from "zod";

const slug = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");

export const toolSchema = z.object({
  id: z.string().optional(), slug, nameEn: z.string().trim().min(2).max(80), nameDe: z.string().trim().min(2).max(80),
  summaryEn: z.string().trim().min(10).max(180), summaryDe: z.string().trim().min(10).max(180),
  descriptionEn: z.string().trim().min(20).max(800), descriptionDe: z.string().trim().min(20).max(800),
  category: z.string().trim().min(2).max(50), icon: z.string().trim().min(2).max(30),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]), featured: z.boolean(), sortOrder: z.number().int().min(0).max(999)
});

export const articleSchema = z.object({
  id: z.string().optional(), slug, titleEn: z.string().trim().min(3).max(140), titleDe: z.string().trim().min(3).max(140),
  excerptEn: z.string().trim().min(20).max(300), excerptDe: z.string().trim().min(20).max(300),
  contentEn: z.string().trim().min(40), contentDe: z.string().trim().min(40),
  seoTitleEn: z.string().trim().max(70).optional(), seoTitleDe: z.string().trim().max(70).optional(),
  seoDescriptionEn: z.string().trim().max(170).optional(), seoDescriptionDe: z.string().trim().max(170).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]), publishedAt: z.string().optional()
});
