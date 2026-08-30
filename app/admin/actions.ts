"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { articleSchema, toolSchema } from "@/lib/validation/admin";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to save content.");
}

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function saveTool(formData: FormData) {
  await requireAdmin();
  const parsed = toolSchema.parse({ id: value(formData, "id") || undefined, slug: value(formData, "slug"), nameEn: value(formData, "nameEn"), nameDe: value(formData, "nameDe"), summaryEn: value(formData, "summaryEn"), summaryDe: value(formData, "summaryDe"), descriptionEn: value(formData, "descriptionEn"), descriptionDe: value(formData, "descriptionDe"), category: value(formData, "category"), icon: value(formData, "icon"), status: value(formData, "status"), featured: formData.get("featured") === "on", sortOrder: Number(value(formData, "sortOrder")) });
  const { id, ...data } = parsed;
  if (id) await getDb().tool.update({ where: { id }, data }); else await getDb().tool.create({ data });
  revalidatePath("/admin/tools"); revalidatePath("/en"); revalidatePath("/de"); redirect("/admin/tools?saved=tool");
}

export async function deleteTool(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  if (id) await getDb().tool.delete({ where: { id } });
  revalidatePath("/admin/tools"); redirect("/admin/tools?deleted=tool");
}

export async function saveArticle(formData: FormData) {
  await requireAdmin();
  const parsed = articleSchema.parse({ id: value(formData, "id") || undefined, slug: value(formData, "slug"), titleEn: value(formData, "titleEn"), titleDe: value(formData, "titleDe"), excerptEn: value(formData, "excerptEn"), excerptDe: value(formData, "excerptDe"), contentEn: value(formData, "contentEn"), contentDe: value(formData, "contentDe"), seoTitleEn: value(formData, "seoTitleEn") || undefined, seoTitleDe: value(formData, "seoTitleDe") || undefined, seoDescriptionEn: value(formData, "seoDescriptionEn") || undefined, seoDescriptionDe: value(formData, "seoDescriptionDe") || undefined, status: value(formData, "status"), publishedAt: value(formData, "publishedAt") || undefined });
  const { id, publishedAt, ...data } = parsed;
  const payload = { ...data, publishedAt: publishedAt ? new Date(publishedAt) : data.status === "PUBLISHED" ? new Date() : null };
  if (id) await getDb().article.update({ where: { id }, data: payload }); else await getDb().article.create({ data: payload });
  revalidatePath("/admin/articles"); revalidatePath("/en/articles"); revalidatePath("/de/articles"); redirect("/admin/articles?saved=article");
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  if (id) await getDb().article.delete({ where: { id } });
  revalidatePath("/admin/articles"); redirect("/admin/articles?deleted=article");
}
