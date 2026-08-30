import type { Metadata } from "next";
import type { Locale } from "@/lib/content/types";

export function localizedAlternates(
  locale: Locale,
  pathname = "",
): Metadata["alternates"] {
  const route = pathname ? `/${pathname.replace(/^\//, "")}` : "";
  return {
    canonical: `/${locale}${route}`,
    languages: {
      en: `/en${route}`,
      de: `/de${route}`,
      "x-default": `/en${route}`,
    },
  };
}

export function jsonLd(value: object) {
  return { __html: JSON.stringify(value).replace(/</g, "\\u003c") };
}
