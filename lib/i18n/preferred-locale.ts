import { defaultLocale, isLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/content/types";

export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;

  const preferences = header
    .split(",")
    .flatMap((entry, index) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(";");
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.split("=")[1])
        : 1;
      const locale = tag.split("-")[0];
      return isLocale(locale)
        ? [{ locale, quality: Number.isFinite(quality) ? quality : 0, index }]
        : [];
    })
    .filter((preference) => preference.quality > 0)
    .sort(
      (left, right) => right.quality - left.quality || left.index - right.index,
    );

  return preferences[0]?.locale ?? defaultLocale;
}
