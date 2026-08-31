import type { ToolSlug } from "@/lib/tools/manifest";

export function reportToolUsage(slug: ToolSlug) {
  void fetch(`/api/tools/${slug}/use`, { method: "POST", keepalive: true });
}
