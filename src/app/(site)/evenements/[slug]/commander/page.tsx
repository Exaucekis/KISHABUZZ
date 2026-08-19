import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckoutForm } from "@/components/events/CheckoutForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { auth } from "@/lib/auth";
import { getEventBySlug } from "@/lib/data";
import { eventOnSale, eventPlace, remainingSeats, RESERVATION_MINUTES, ticketTypeOnSale } from "@/lib/events";
import { formatSessionsSummary, formatTicketValidity, sessionsForTicketType, ticketTypeHasLiveDay } from "@/lib/event-schedule";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Réserver — ${event.title}` : "Réserver",
    robots: { index: false, follow: false },
  };
}

export default async function EventCheckoutPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=/evenements/${slug}/commander`);
  }

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const onSale = eventOnSale(event);
  const schedule = event.sessions || [];
  const types = event.ticketTypes.filter(
    (type) =>
      ticketTypeOnSale(type) &&
      remainingSeats(type) > 0 &&
      ticketTypeHasLiveDay(
        schedule,
        type.sessions.map((row) => row.sessionId)
      )
  );
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });
  const scheduleDays = schedule.length
    ? schedule.map((day) => ({
        id: day.id,
        access: (day.access === "FREE" ? "FREE" : "PAID") as "PAID" | "FREE",
        label: `${formatDate(day.startsAt, "EEEE d MMMM")}${day.access === "FREE" ? " · entrée libre" : ""}`,
      }))
    : [
        {
          id: event.id,
          access: "PAID" as const,
          label: formatDate(event.startsAt, "EEEE d MMMM"),
        },
      ];
  const paidIds = scheduleDays.filter((day) => day.access === "PAID").map((day) => day.id);

  return (
    <section className="mx-auto max-w-3xl px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Billetterie</p>
      <h1 className="mt-3 font-display text-4xl uppercase">{event.title}</h1>
      <p className="mt-4 text-paper-muted">
        {formatSessionsSummary(schedule, event.startsAt, event.endsAt)}
        {eventPlace(event) ? ` · ${eventPlace(event)}` : ""}
      </p>
      <p className="mt-2 text-sm text-paper-muted">
        Mélangez les catégories (2 VVIP, 2 VIP, 1 Standard…). Réservation {RESERVATION_MINUTES}{" "}
        minutes, un seul paiement.
      </p>
      <span className="section-line mt-6" aria-hidden />

      {!onSale || !types.length ? (
        <div className="mt-10">
          <EmptyState
            title={onSale ? "Complet" : "Vente fermée"}
            description="Cet événement n’accepte plus de réservations en ligne pour le moment."
            action={
              <Link href={`/evenements/${event.slug}`} className="text-sm font-semibold text-ember-text">
                Retour à l’événement
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 border border-line bg-ink-2 p-6">
          <CheckoutForm
            eventId={event.id}
            currency={event.currency}
            phone={user?.phone || ""}
            days={scheduleDays}
            types={types.map((type) => ({
              id: type.id,
              name: type.name,
              description: type.description,
              benefits: type.benefits,
              price: type.price,
              remaining: remainingSeats(type),
              maxPerOrder: type.maxPerOrder,
              sessionIds: type.sessions.length ? type.sessions.map((row) => row.sessionId) : paidIds,
              validity: formatTicketValidity(
                sessionsForTicketType(
                  schedule,
                  type.sessions.map((row) => row.sessionId)
                )
              ),
            }))}
          />
        </div>
      )}
    </section>
  );
}
