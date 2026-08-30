import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/tools/[slug]/use">,
) {
  if (!process.env.DATABASE_URL) return new NextResponse(null, { status: 204 });
  const { slug } = await params;
  const tool = await getDb().tool.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!tool)
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  await getDb().$transaction([
    getDb().tool.update({
      where: { id: tool.id },
      data: { usageCount: { increment: 1 } },
    }),
    getDb().toolUsage.create({ data: { toolId: tool.id } }),
  ]);
  return new NextResponse(null, { status: 204 });
}
