import { NextResponse } from "next/server";
import { parseCinetPayNotifyBody } from "@/lib/cinetpay";
import { applyCinetPayCheck } from "@/lib/ticket-orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ok() {
  return new NextResponse("OK", { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function GET() {
  return ok();
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const contentType = request.headers.get("content-type") || "";
    const { transactionId } = parseCinetPayNotifyBody(contentType, raw);
    if (transactionId) {
      await applyCinetPayCheck(transactionId, "NOTIFY");
    }
  } catch (error) {
    console.error("[cinetpay] notify", error);
  }
  return ok();
}
