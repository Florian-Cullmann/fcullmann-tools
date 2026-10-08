import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  permanentRedirect(`/${locale}/tools`);
}
