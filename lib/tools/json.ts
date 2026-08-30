export type FormatJsonResult = { ok: true; value: string } | { ok: false; error: string };

export function formatJson(input: string, spaces = 2): FormatJsonResult {
  try {
    return { ok: true, value: JSON.stringify(JSON.parse(input), null, spaces) };
  } catch (reason) {
    return { ok: false, error: reason instanceof Error ? reason.message : "Invalid JSON" };
  }
}
