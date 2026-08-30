import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({ locale: z.enum(["en", "de"]) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set("fc-locale", parsed.data.locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
