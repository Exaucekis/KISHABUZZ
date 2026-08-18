import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildTicketPdf } from "@/lib/ticket-pdf";
import { getOwnedTicket } from "@/lib/tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ ticketId: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { ticketId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(`/connexion?callbackUrl=/compte/billets/${ticketId}/pdf`, _request.url));
  }

  const ticket = await getOwnedTicket(ticketId, session.user.id);
  if (!ticket) {
    return NextResponse.json({ message: "Billet introuvable." }, { status: 404 });
  }

  const bytes = await buildTicketPdf({
    publicCode: ticket.publicCode,
    holderName: ticket.holderName,
    eventTitle: ticket.event.title,
    startsAt: ticket.event.startsAt,
    venueName: ticket.event.venueName,
    city: ticket.event.city,
    address: ticket.event.address,
    ticketType: ticket.ticketType.name,
    orderNumber: ticket.order.orderNumber,
    amount: ticket.ticketType.price,
    currency: ticket.order.currency,
  });

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kishabuzz-${ticket.publicCode}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
