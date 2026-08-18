import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scanTicketAtEvent, type ScanOutcome } from "@/lib/ticket-scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleScan(rawPayload: string, eventId: string, request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ result: "INVALID", message: "Connexion requise.", ticket: null } satisfies ScanOutcome, {
      status: 401,
    });
  }

  const outcome = await scanTicketAtEvent({
    rawPayload,
    eventId,
    staffUserId: session.user.id,
    staffRole: session.user.role,
    deviceNote: request.headers.get("user-agent") || "",
  });

  return NextResponse.json(outcome);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return handleScan(url.searchParams.get("code") || "", url.searchParams.get("eventId") || "", request);
}

export async function POST(request: Request) {
  let body: { payload?: string; eventId?: string } = {};
  try {
    body = (await request.json()) as { payload?: string; eventId?: string };
  } catch {
    body = {};
  }
  return handleScan(String(body.payload || ""), String(body.eventId || ""), request);
}
