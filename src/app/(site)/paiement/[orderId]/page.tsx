import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RefreshPaymentButton } from "@/components/events/RefreshPaymentButton";
import { auth } from "@/lib/auth";
import { storedPaymentUrl } from "@/lib/ticket-orders";
import { formatMoney, orderStatusLabel } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ orderId: string }> };

export default async function PaymentStatusPage({ params }: Props) {
  const { orderId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=/paiement/${orderId}`);
  }

  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: {
      event: { select: { title: true, slug: true, startsAt: true } },
      payment: true,
      items: { include: { ticketType: { select: { name: true } } } },
    },
  });
  if (!order || order.userId !== session.user.id) notFound();
  if (order.status === "PAID") redirect(`/paiement/${order.id}/confirmation`);

  const payUrl = order.payment ? storedPaymentUrl(order.payment.rawCheckJson) : "";

  return (
    <section className="mx-auto max-w-xl px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Paiement</p>
      <h1 className="mt-3 font-display text-4xl uppercase">{orderStatusLabel(order.status)}</h1>
      <p className="mt-4 text-paper-muted">
        Commande {order.orderNumber} · {order.event.title}
      </p>
      <p className="mt-1 text-sm text-paper-muted">
        {formatDate(order.event.startsAt, "EEEE d MMMM yyyy · HH:mm")} · {formatMoney(order.amount, order.currency)}
      </p>
      <ul className="mt-6 space-y-2 text-sm text-paper-muted">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.quantity} × {item.ticketType.name}
          </li>
        ))}
      </ul>
      <div className="mt-8 space-y-3">
        {payUrl && (order.status === "AWAITING_PAYMENT" || order.status === "PENDING") ? (
          <a
            href={payUrl}
            className="inline-flex w-full items-center justify-center rounded-md bg-ember px-5 py-3 text-sm font-bold text-on-ember hover:bg-ember-hot"
          >
            Continuer vers CinetPay
          </a>
        ) : null}
        {order.payment && (order.status === "AWAITING_PAYMENT" || order.status === "PENDING") ? (
          <RefreshPaymentButton orderId={order.id} />
        ) : null}
        <Link href={`/evenements/${order.event.slug}`} className="block text-sm text-paper-muted hover:text-paper">
          Retour à l’événement
        </Link>
      </div>
    </section>
  );
}
