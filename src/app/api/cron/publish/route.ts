import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron-auth";
import { publishDueArticles, publishDueArenaShows } from "@/lib/publish-scheduled";
import { expireExpiredReservations } from "@/lib/ticket-orders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  const [articles, shows, tickets] = await Promise.all([
    publishDueArticles(),
    publishDueArenaShows(),
    expireExpiredReservations(80),
  ]);
  return NextResponse.json({ ok: true, articles, shows, tickets });
}
