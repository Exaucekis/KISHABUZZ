import { NextResponse } from "next/server";
import { publishDueArticles } from "@/lib/publish-scheduled";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  const published = await publishDueArticles();
  return NextResponse.json({ ok: true, published });
}
