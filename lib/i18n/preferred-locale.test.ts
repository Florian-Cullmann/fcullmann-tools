import { describe, expect, it } from "vitest";
import { localeFromAcceptLanguage } from "@/lib/i18n/preferred-locale";

describe("localeFromAcceptLanguage", () => {
  it("uses the highest-priority supported language", () => {
    expect(localeFromAcceptLanguage("en-US,en;q=0.9,de;q=0.8")).toBe("en");
    expect(localeFromAcceptLanguage("fr-FR,de;q=0.9,en;q=0.5")).toBe("de");
  });

  it("falls back to English when no supported language is present", () => {
    expect(localeFromAcceptLanguage("fr-FR,fr;q=0.9")).toBe("en");
    expect(localeFromAcceptLanguage(null)).toBe("en");
  });

  it("ignores explicitly rejected languages", () => {
    expect(localeFromAcceptLanguage("de;q=0,en;q=0.5")).toBe("en");
  });
});
