import Link from "next/link";
import { Ticket } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney, orderStatusLabel, ticketStatusLabel } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Mes billets" };
export const dynamic = "force-dynamic";

export default async function CompteBilletsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/compte/billets");

  const [tickets, pending] = await Promise.all([
    prisma.ticket.findMany({
      where: { userId: session.user.id, order: { status: { in: ["PAID", "REFUNDED"] } } },
      include: {
        event: { select: { title: true, slug: true, startsAt: true } },
        ticketType: { select: { name: true } },
        order: { select: { orderNumber: true, currency: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ticketOrder.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "AWAITING_PAYMENT"] },
      },
      include: { event: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Espace membre</p>
      <h1 className="mt-3 font-display text-4xl uppercase">Mes billets</h1>
      <span className="section-line mt-4" aria-hidden />

      {pending.length ? (
        <div className="mt-8 space-y-3">
          <h2 className="font-display text-xl">Paiements en cours</h2>
          {pending.map((order) => (
            <Link
              key={order.id}
              href={`/paiement/${order.id}`}
              className="block border border-line bg-ink-2 px-4 py-3 hover:border-ember"
            >
              <p className="font-semibold">{order.event.title}</p>
              <p className="mt-1 text-sm text-paper-muted">
                {order.orderNumber} · {orderStatusLabel(order.status)} · {formatMoney(order.amount, order.currency)}
              </p>
            </Link>
          ))}
        </div>
      ) : null}

      {tickets.length ? (
        <ul className="mt-10 space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="border border-line bg-ink-2 px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-ember-text">{ticket.ticketType.name}</p>
              <p className="mt-1 font-display text-2xl uppercase">{ticket.event.title}</p>
              <p className="mt-1 text-sm text-paper-muted">
                {formatDate(ticket.event.startsAt, "EEEE d MMMM yyyy · HH:mm")}
              </p>
              <p className="mt-3 font-mono text-sm text-ember-text">{ticket.publicCode}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-paper-muted">
                {ticketStatusLabel(ticket.status)}
                {ticket.order.status === "REFUNDED" ? " · Commande remboursée" : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {ticket.status === "VALID" ? (
                  <Link
                    href={`/compte/billets/${ticket.id}`}
                    className="rounded-md bg-ember px-4 py-2 text-sm font-bold text-on-ember hover:bg-ember-hot"
                  >
                    QR code
                  </Link>
                ) : (
                  <Link
                    href={`/compte/billets/${ticket.id}`}
                    className="rounded-md border border-line px-4 py-2 text-sm"
                  >
                    Détail
                  </Link>
                )}
                <a href={`/compte/billets/${ticket.id}/pdf`} className="rounded-md border border-line px-4 py-2 text-sm">
                  PDF
                </a>
                <Link href={`/evenements/${ticket.event.slug}`} className="rounded-md border border-line px-4 py-2 text-sm text-paper-muted hover:text-paper">
                  Événement
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : pending.length ? null : (
        <div className="mt-10">
          <EmptyState
            title="Aucun billet pour l’instant"
            description="Réservez une place sur un événement publié : le paiement CinetPay délivre vos tickets ici."
            action={
              <Link
                href="/evenements"
                className="inline-flex items-center gap-2 rounded-md bg-ember px-5 py-3 text-sm font-bold text-on-ember hover:bg-ember-hot"
              >
                <Ticket className="h-4 w-4" aria-hidden />
                Voir les événements
              </Link>
            }
          />
        </div>
      )}
    </section>
  );
}
