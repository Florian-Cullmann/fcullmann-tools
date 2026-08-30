import { describe, expect, it } from "vitest";
import { alternateLocale, isLocale } from "@/lib/i18n/config";

describe("locale configuration", () => {
  it("accepts only supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("switches between both supported locales", () => {
    expect(alternateLocale("en")).toBe("de");
    expect(alternateLocale("de")).toBe("en");
  });
});
