import { describe, expect, it } from "vitest";
import { formatJson } from "@/lib/tools/json";

describe("formatJson", () => {
  it("formats valid JSON with stable indentation", () => {
    expect(formatJson('{"name":"Florian","active":true}')).toEqual({
      ok: true,
      value: '{\n  "name": "Florian",\n  "active": true\n}',
    });
  });

  it("returns a useful parser error for invalid JSON", () => {
    const result = formatJson('{"name":}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });

  it("supports a configurable indentation width", () => {
    const result = formatJson('{"value":1}', 4);
    expect(result.ok && result.value).toContain('    "value"');
  });
});
