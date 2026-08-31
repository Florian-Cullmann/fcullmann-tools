import { NextResponse } from "next/server";
import { recordToolUsage } from "@/lib/tools/usage";

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/tools/[slug]/use">,
) {
  const { slug } = await params;
  const result = await recordToolUsage(slug);
  if (result === "not-found") {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
