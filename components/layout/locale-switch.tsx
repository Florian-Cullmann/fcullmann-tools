"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/content/types";
import { alternateLocale } from "@/lib/i18n/config";

export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = alternateLocale(locale);

  async function switchLocale() {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
  }

  return (
    <button
      className="locale-switch"
      type="button"
      onClick={switchLocale}
      aria-label={
        nextLocale === "de" ? "Auf Deutsch wechseln" : "Switch to English"
      }
    >
      <Languages aria-hidden="true" size={17} />
      <span>{locale.toUpperCase()}</span>
    </button>
  );
}
