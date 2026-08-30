import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { demoArticles, demoProjects, demoTools } from "../lib/content/demo";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database.");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  for (const tool of demoTools) {
    await db.tool.upsert({ where: { slug: tool.slug }, update: {}, create: { slug: tool.slug, nameEn: tool.name.en, nameDe: tool.name.de, summaryEn: tool.summary.en, summaryDe: tool.summary.de, descriptionEn: tool.description.en, descriptionDe: tool.description.de, category: tool.category, icon: tool.icon, featured: tool.featured, sortOrder: tool.sortOrder, status: "PUBLISHED" } });
  }
  await db.tool.upsert({
    where: { slug: "pdf-converter" },
    update: {},
    create: {
      slug: "pdf-converter",
      nameEn: "PDF Converter",
      nameDe: "PDF-Konverter",
      summaryEn: "Convert and prepare PDF documents.",
      summaryDe: "PDF-Dokumente konvertieren und aufbereiten.",
      descriptionEn: "A planned collection of focused PDF workflows with verified processing and privacy guarantees.",
      descriptionDe: "Eine geplante Sammlung fokussierter PDF-Workflows mit verifizierter Verarbeitung und Datenschutzgarantie.",
      category: "documents",
      icon: "link",
      featured: false,
      sortOrder: 20,
      status: "DRAFT"
    }
  });
  for (const article of demoArticles) {
    await db.article.upsert({ where: { slug: article.slug }, update: {}, create: { slug: article.slug, titleEn: article.title.en, titleDe: article.title.de, excerptEn: article.excerpt.en, excerptDe: article.excerpt.de, contentEn: article.content.en, contentDe: article.content.de, status: "PUBLISHED", publishedAt: article.publishedAt } });
  }
  for (const project of demoProjects) {
    await db.project.upsert({ where: { slug: project.slug }, update: {}, create: { slug: project.slug, title: project.title, summaryEn: project.summary.en, summaryDe: project.summary.de, descriptionEn: project.description.en, descriptionDe: project.description.de, technologies: project.technologies, url: project.url, repositoryUrl: project.repositoryUrl, featured: true, status: "PUBLISHED", publishedAt: new Date() } });
  }
}

main().finally(async () => db.$disconnect());
