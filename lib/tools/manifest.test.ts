import { describe, expect, it } from "vitest";
import {
  implementedToolSlugs,
  isImplementedToolSlug,
} from "@/lib/tools/manifest";

describe("tool manifest", () => {
  it("contains unique slugs", () => {
    expect(new Set(implementedToolSlugs).size).toBe(implementedToolSlugs.length);
  });

  it("recognizes only implemented tools", () => {
    expect(isImplementedToolSlug("pdf-merge")).toBe(true);
    expect(isImplementedToolSlug("future-tool")).toBe(false);
  });
});
