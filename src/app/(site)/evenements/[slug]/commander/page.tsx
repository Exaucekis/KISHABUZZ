import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckoutForm } from "@/components/events/CheckoutForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { auth } from "@/lib/auth";
import { getEventBySlug } from "@/lib/data";
import { eventOnSale, eventPlace, formatMoney, remainingSeats, ticketTypeOnSale } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

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
  const types = event.ticketTypes.filter((type) => ticketTypeOnSale(type) && remainingSeats(type) > 0);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true },
  });

  return (
    <section className="mx-auto max-w-3xl px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Billetterie</p>
      <h1 className="mt-3 font-display text-4xl uppercase">{event.title}</h1>
      <p className="mt-4 text-paper-muted">
        {formatDate(event.startsAt, "EEEE d MMMM yyyy · HH:mm")}
        {eventPlace(event) ? ` · ${eventPlace(event)}` : ""}
      </p>
      <p className="mt-2 text-sm text-paper-muted">
        Les places sont réservées 15 minutes. Vous serez redirigé vers CinetPay pour le paiement.
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
          <p className="text-sm text-paper-muted">
            À partir de{" "}
            {formatMoney(Math.min(...types.map((type) => type.price)), event.currency)}
          </p>
          <div className="mt-6">
            <CheckoutForm
              eventId={event.id}
              currency={event.currency}
              phone={user?.phone || ""}
              types={types.map((type) => ({
                id: type.id,
                name: type.name,
                description: type.description,
                benefits: type.benefits,
                price: type.price,
                remaining: remainingSeats(type),
                maxPerOrder: type.maxPerOrder,
              }))}
            />
          </div>
        </div>
      )}
    </section>
  );
}
