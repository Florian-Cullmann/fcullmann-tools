import { getDb } from "@/lib/db";
import { isImplementedToolSlug } from "@/lib/tools/manifest";

export type ToolUsageResult = "recorded" | "disabled" | "not-found";

export async function recordToolUsage(slug: string): Promise<ToolUsageResult> {
  if (!isImplementedToolSlug(slug)) return "not-found";
  if (!process.env.DATABASE_URL) return "disabled";

  const db = getDb();
  const tool = await db.tool.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!tool) return "not-found";

  await db.$transaction([
    db.tool.update({
      where: { id: tool.id },
      data: { usageCount: { increment: 1 } },
    }),
    db.toolUsage.create({ data: { toolId: tool.id } }),
  ]);
  return "recorded";
}
