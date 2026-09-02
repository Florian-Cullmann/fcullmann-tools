import type { Locale } from "@/lib/i18n/types";

const labels: Record<string, Record<Locale, string>> = {
  documents: { en: "Documents", de: "Dokumente" },
  images: { en: "Image tools", de: "Bild-Tools" },
  formatters: { en: "Formatters", de: "Formatierer" },
  encoders: { en: "Encoders", de: "Kodierer" },
  generators: { en: "Generators", de: "Generatoren" },
  converters: { en: "Converters", de: "Konverter" },
  text: { en: "Text", de: "Text" },
  office: { en: "Office", de: "Office" },
};

export function getToolCategoryLabel(category: string, locale: Locale) {
  return labels[category]?.[locale] ?? category;
}
