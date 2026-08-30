import { describe, expect, it } from "vitest";
import {
  getTextStats,
  hexToRgb,
  parseTimestamp,
  toSlug,
  toTitleCase,
} from "@/lib/tools/converters";

describe("browser converter helpers", () => {
  it("parses Unix seconds and ISO dates", () => {
    expect(parseTimestamp("0")?.iso).toBe("1970-01-01T00:00:00.000Z");
    expect(parseTimestamp("2026-08-30T12:00:00.000Z")?.seconds).toBe(
      1788091200,
    );
    expect(parseTimestamp("not-a-date")).toBeNull();
  });

  it("converts short and long HEX colors", () => {
    expect(hexToRgb("#e43")).toEqual({
      hex: "#EE4433",
      red: 238,
      green: 68,
      blue: 51,
    });
    expect(hexToRgb("#3977be")).toEqual({
      hex: "#3977BE",
      red: 57,
      green: 119,
      blue: 190,
    });
    expect(hexToRgb("wrong")).toBeNull();
  });

  it("counts text and normalizes reusable strings", () => {
    expect(getTextStats("one two\nthree")).toEqual({
      words: 3,
      characters: 13,
      charactersWithoutSpaces: 11,
      lines: 2,
    });
    expect(toSlug("Über focused Tools!", "de")).toBe("uber-focused-tools");
    expect(toTitleCase("useful SOFTWARE", "en")).toBe("Useful Software");
  });
});
