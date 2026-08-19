import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download } from "lucide-react";
import { TicketQrCard } from "@/components/events/TicketQrCard";
import { auth } from "@/lib/auth";
import { eventPlace, ticketStatusLabel } from "@/lib/events";
import { formatSessionsSummary, formatTicketValidity, sessionsForTicketType } from "@/lib/event-schedule";
import { ticketQrDataUrl } from "@/lib/ticket-qr";
import { getOwnedTicket } from "@/lib/tickets";

type Props = { params: Promise<{ ticketId: string }> };

export const metadata: Metadata = { title: "Billet", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=/compte/billets/${ticketId}`);
  }

  const ticket = await getOwnedTicket(ticketId, session.user.id);
  if (!ticket) notFound();

  const validity = formatTicketValidity(
    sessionsForTicketType(
      ticket.event.sessions,
      ticket.ticketType.sessions.map((row) => row.sessionId)
    )
  );
  const qr = ticket.status === "VALID" ? await ticketQrDataUrl(ticket.publicCode, 420) : "";
  const place = eventPlace(ticket.event);
  const inactive = ticket.status !== "VALID";

  return (
    <section className="mx-auto max-w-xl px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">
        {ticketStatusLabel(ticket.status)}
      </p>
      <h1 className="mt-3 font-display text-4xl uppercase">{ticket.event.title}</h1>
      <p className="mt-4 text-paper-muted">
        {formatSessionsSummary(ticket.event.sessions, ticket.event.startsAt, ticket.event.endsAt)}
        {place ? ` · ${place}` : ""}
      </p>
      <p className="mt-1 text-sm text-paper-muted">
        {ticket.ticketType.name}
        {validity ? ` · ${validity}` : ""} · {ticket.holderName} · {ticket.order.orderNumber}
      </p>

      {inactive ? (
        <p className="mt-8 border border-line bg-ink-2 px-4 py-4 text-sm text-paper-muted">
          Ce billet n’est plus valable à l’entrée
          {ticket.status === "REFUNDED" || ticket.order.status === "REFUNDED"
            ? " (remboursé)"
            : ticket.status === "CANCELLED"
              ? " (événement annulé)"
              : ticket.status === "USED"
                ? " (déjà scanné)"
                : ""}
          .
        </p>
      ) : (
        <div className="mt-8">
          <TicketQrCard dataUrl={qr} code={ticket.publicCode} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`/compte/billets/${ticket.id}/pdf`}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-5 py-3 text-sm font-bold text-on-ember hover:bg-ember-hot"
        >
          <Download className="h-4 w-4" aria-hidden />
          Télécharger le PDF
        </a>
        <Link href="/compte/billets" className="rounded-md border border-line px-5 py-3 text-sm">
          Tous mes billets
        </Link>
      </div>
    </section>
  );
}
