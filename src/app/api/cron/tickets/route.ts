import { NextResponse } from "next/server";
import { expireExpiredReservations } from "@/lib/ticket-orders";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  const result = await expireExpiredReservations(80);
  return NextResponse.json({ ok: true, ...result });
}
