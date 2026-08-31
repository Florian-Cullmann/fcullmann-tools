import type { Locale } from "@/lib/i18n/types";

export const locales = ["en", "de"] as const;
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function alternateLocale(locale: Locale): Locale {
  return locale === "en" ? "de" : "en";
}
