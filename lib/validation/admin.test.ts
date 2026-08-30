import { describe, expect, it } from "vitest";
import { toolSchema } from "@/lib/validation/admin";

const validTool = {
  slug: "json-formatter", nameEn: "JSON Formatter", nameDe: "JSON-Formatierer",
  summaryEn: "Format and validate JSON input.", summaryDe: "JSON-Eingaben formatieren und validieren.",
  descriptionEn: "Format and validate JSON locally in the browser.", descriptionDe: "JSON lokal im Browser formatieren und validieren.",
  category: "formatters", icon: "braces", status: "PUBLISHED", featured: true, sortOrder: 1
};

describe("toolSchema", () => {
  it("accepts complete bilingual tool data", () => {
    expect(toolSchema.safeParse(validTool).success).toBe(true);
  });

  it("rejects unsafe route slugs", () => {
    expect(toolSchema.safeParse({ ...validTool, slug: "JSON Formatter" }).success).toBe(false);
  });
});
