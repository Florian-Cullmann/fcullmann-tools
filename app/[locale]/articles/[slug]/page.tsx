import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

export default async function ArticlePage({
  params,
}: PageProps<"/[locale]/articles/[slug]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  permanentRedirect(`/${locale}/tools`);
}
