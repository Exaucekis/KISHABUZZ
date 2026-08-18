import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eventPlace, ticketStatusLabel } from "@/lib/events";
import { isPublicCode } from "@/lib/ticket-codes";
import { verifyTicketSignature } from "@/lib/ticket-qr";
import { getTicketByPublicCode } from "@/lib/tickets";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ s?: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Billet KISHA BUZZ",
  robots: { index: false, follow: false },
};

export default async function PublicTicketPage({ params, searchParams }: Props) {
  const { code } = await params;
  const { s } = await searchParams;
  const publicCode = decodeURIComponent(code).toUpperCase();
  if (!isPublicCode(publicCode)) notFound();

  const ticket = await getTicketByPublicCode(publicCode);
  if (!ticket || ticket.order.status !== "PAID") notFound();

  const signed = s ? verifyTicketSignature(publicCode, s) : false;
  const place = eventPlace(ticket.event);

  return (
    <section className="mx-auto max-w-lg px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">
        {ticketStatusLabel(ticket.status)}
        {signed ? " · QR authentifié" : ""}
      </p>
      <h1 className="mt-3 font-display text-4xl uppercase">{ticket.event.title}</h1>
      <p className="mt-4 text-paper-muted">
        {formatDate(ticket.event.startsAt, "EEEE d MMMM yyyy · HH:mm")}
        {place ? ` · ${place}` : ""}
      </p>
      <p className="mt-2 text-sm text-paper-muted">{ticket.ticketType.name}</p>
      <p className="mt-6 font-mono text-lg text-ember-text">{ticket.publicCode}</p>
      <p className="mt-8 text-sm text-paper-muted">
        Ce lien identifie un billet KISHA BUZZ. À l’entrée, présentez le QR depuis votre compte.
      </p>
    </section>
  );
}
