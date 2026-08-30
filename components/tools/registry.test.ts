import { describe, expect, it } from "vitest";
import {
  getToolWorkspace,
  registeredToolSlugs,
} from "@/components/tools/registry";
import { demoTools } from "@/lib/content/demo";

describe("tool workspace registry", () => {
  it("provides a workspace for every bundled tool", () => {
    expect(new Set(registeredToolSlugs)).toEqual(
      new Set(demoTools.map((tool) => tool.slug)),
    );
  });

  it("returns null for an unknown tool", () => {
    expect(getToolWorkspace("not-implemented")).toBeNull();
  });
});
