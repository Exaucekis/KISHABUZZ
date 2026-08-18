import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ orderId: string }> };

export default async function PaymentConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=/paiement/${orderId}/confirmation`);
  }

  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: {
      event: { select: { title: true, slug: true, startsAt: true, venueName: true, city: true } },
      tickets: { include: { ticketType: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!order || order.userId !== session.user.id) notFound();
  if (order.status !== "PAID") redirect(`/paiement/${order.id}`);

  return (
    <section className="mx-auto max-w-2xl px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Confirmation</p>
      <h1 className="mt-3 font-display text-4xl uppercase">Billets confirmés</h1>
      <p className="mt-4 text-lg text-paper-muted">
        Commande {order.orderNumber} · {formatMoney(order.amount, order.currency)}
      </p>
      <p className="mt-2 text-paper-muted">
        {order.event.title} · {formatDate(order.event.startsAt, "EEEE d MMMM yyyy · HH:mm")}
      </p>
      <ul className="mt-8 space-y-3">
        {order.tickets.map((ticket) => (
          <li key={ticket.id} className="border border-line bg-ink-2 px-4 py-3">
            <p className="font-semibold">{ticket.ticketType.name}</p>
            <p className="mt-1 font-mono text-sm text-ember-text">{ticket.publicCode}</p>
            <Link href={`/compte/billets/${ticket.id}`} className="mt-2 inline-block text-sm font-semibold text-ember-text">
              Voir le QR
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/compte/billets"
          className="rounded-md bg-ember px-5 py-3 text-sm font-bold text-on-ember hover:bg-ember-hot"
        >
          Mes billets
        </Link>
        <Link href={`/evenements/${order.event.slug}`} className="rounded-md border border-line px-5 py-3 text-sm">
          Voir l’événement
        </Link>
      </div>
    </section>
  );
}
