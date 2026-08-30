import { describe, expect, it } from "vitest";
import {
  getPdfCompressionScale,
  PDF_COMPRESSION_PRESETS,
} from "@/lib/tools/pdf-compress";

describe("PDF compression settings", () => {
  it("uses increasingly detailed render resolutions", () => {
    const page = [595, 842] as const;

    expect(getPdfCompressionScale(...page, "small")).toBeCloseTo(
      PDF_COMPRESSION_PRESETS.small.dpi / 72,
    );
    expect(getPdfCompressionScale(...page, "balanced")).toBeCloseTo(
      PDF_COMPRESSION_PRESETS.balanced.dpi / 72,
    );
    expect(getPdfCompressionScale(...page, "high")).toBeCloseTo(
      PDF_COMPRESSION_PRESETS.high.dpi / 72,
    );
  });

  it("caps very large pages to a safe canvas size", () => {
    const scale = getPdfCompressionScale(4_000, 3_000, "high");

    expect(4_000 * scale * (3_000 * scale)).toBeCloseTo(6_000_000);
  });

  it("rejects invalid page dimensions", () => {
    expect(() => getPdfCompressionScale(0, 842, "balanced")).toThrow(
      "PDF page dimensions must be positive numbers.",
    );
  });
});
