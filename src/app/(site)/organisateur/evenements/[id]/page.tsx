import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrganizerKpis } from "@/components/events/OrganizerKpis";
import { RefundOrderForm } from "@/components/events/RefundOrderForm";
import { auth } from "@/lib/auth";
import { eventPlace, eventStatusLabel, formatMoney, orderStatusLabel, ticketStatusLabel } from "@/lib/events";
import { formatFillPercent } from "@/lib/organizer-stats";
import { canManageEventDashboard, getEventDashboard } from "@/lib/organizer";
import { scanResultLabel } from "@/lib/ticket-scan-core";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function OrganizerEventPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/connexion?callbackUrl=/organisateur/evenements/${id}`);
  if (!(await canManageEventDashboard(session.user.id, session.user.role, id))) {
    redirect("/organisateur");
  }

  const data = await getEventDashboard(id);
  if (!data) notFound();
  const { event, stats, paidOrders, pendingOrders, refundedOrders } = data;

  return (
    <section className="mx-auto max-w-5xl px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">
        {event.category?.name || "Événement"} · {eventStatusLabel(event.status)}
      </p>
      <h1 className="mt-3 font-display text-4xl uppercase">{event.title}</h1>
      <p className="mt-4 text-paper-muted">
        {formatDate(event.startsAt, "EEEE d MMMM yyyy · HH:mm")}
        {eventPlace(event) ? ` · ${eventPlace(event)}` : ""}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/organisateur" className="rounded-md border border-line px-4 py-2 text-sm">
          Tous les événements
        </Link>
        <Link
          href={`/scan?event=${event.id}`}
          className="rounded-md bg-ember px-4 py-2 text-sm font-bold text-on-ember"
        >
          Scanner l’entrée
        </Link>
      </div>
      <span className="section-line mt-6" aria-hidden />

      <div className="mt-8">
        <OrganizerKpis
          capacity={stats.capacity}
          sold={stats.sold}
          reserved={stats.reserved}
          remaining={stats.remaining}
          fillLabel={formatFillPercent(stats.sold, stats.capacity)}
          scanned={stats.scanned}
          scanRate={stats.scanRate}
          revenue={stats.revenue}
          currency={event.currency}
        />
      </div>
      {pendingOrders.length ? (
        <p className="mt-3 text-sm text-paper-muted">
          {pendingOrders.length} commande{pendingOrders.length > 1 ? "s" : ""} encore en attente de paiement.
        </p>
      ) : null}

      <h2 className="mt-12 font-display text-2xl">Tarifs</h2>
      <ul className="mt-4 space-y-4">
        {stats.types.map((type) => (
          <li key={type.id} className="border border-line bg-ink-2 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{type.name}</p>
              <p className="text-sm text-paper-muted">
                {type.soldCount} / {type.quantity} · {formatMoney(type.revenue, event.currency)}
              </p>
            </div>
            <div className="mt-3 h-2 bg-ink-3">
              <div className="h-2 bg-ember" style={{ width: `${type.share}%` }} />
            </div>
            <p className="mt-2 text-xs uppercase tracking-wide text-paper-muted">
              {type.remaining} restant{type.remaining > 1 ? "s" : ""} · {type.share} % des ventes
            </p>
          </li>
        ))}
        {!stats.types.length ? <li className="text-sm text-paper-muted">Aucun tarif.</li> : null}
      </ul>

      <h2 className="mt-12 font-display text-2xl">Participants</h2>
      <div className="mt-4 overflow-x-auto border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-ink-2 text-xs uppercase tracking-wide text-paper-muted">
            <tr>
              <th className="px-3 py-3">Titulaire</th>
              <th className="px-3 py-3">Tarif</th>
              <th className="px-3 py-3">Code</th>
              <th className="px-3 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {event.tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t border-line">
                <td className="px-3 py-3">{ticket.holderName}</td>
                <td className="px-3 py-3 text-paper-muted">{ticket.ticketType.name}</td>
                <td className="px-3 py-3 font-mono text-ember-text">{ticket.publicCode}</td>
                <td className="px-3 py-3 text-paper-muted">{ticketStatusLabel(ticket.status)}</td>
              </tr>
            ))}
            {!event.tickets.length ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-paper-muted">
                  Aucun billet délivré pour l’instant.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 font-display text-2xl">Paiements</h2>
      <div className="mt-4 overflow-x-auto border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-ink-2 text-xs uppercase tracking-wide text-paper-muted">
            <tr>
              <th className="px-3 py-3">Commande</th>
              <th className="px-3 py-3">Acheteur</th>
              <th className="px-3 py-3">Montant</th>
              <th className="px-3 py-3">Moyen</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3">Remboursement</th>
            </tr>
          </thead>
          <tbody>
            {paidOrders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-3 py-3 font-mono text-xs">{order.orderNumber}</td>
                <td className="px-3 py-3">
                  {order.buyerName}
                  <span className="mt-0.5 block text-xs text-paper-muted">{order.buyerEmail}</span>
                </td>
                <td className="px-3 py-3 tabular-nums">{formatMoney(order.amount, order.currency)}</td>
                <td className="px-3 py-3 text-paper-muted">{order.payment?.paymentMethod || "—"}</td>
                <td className="px-3 py-3 text-paper-muted">{orderStatusLabel(order.status)}</td>
                <td className="px-3 py-3 align-top">
                  <RefundOrderForm orderId={order.id} amount={order.amount} currency={order.currency} />
                </td>
              </tr>
            ))}
            {!paidOrders.length ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-paper-muted">
                  Aucun paiement encaissé.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {refundedOrders.length ? (
        <>
          <h2 className="mt-12 font-display text-2xl">Remboursés</h2>
          <ul className="mt-4 space-y-2">
            {refundedOrders.map((order) => (
              <li key={order.id} className="border border-line bg-ink-2 px-4 py-3 text-sm">
                <span className="font-mono text-xs">{order.orderNumber}</span>
                {" · "}
                {order.buyerName}
                {" · "}
                {formatMoney(order.amount, order.currency)}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h2 className="mt-12 font-display text-2xl">Derniers scans</h2>
      <ul className="mt-4 divide-y divide-line border border-line">
        {event.scans.map((scan) => (
          <li key={scan.id} className="flex flex-wrap justify-between gap-3 px-3 py-3 text-sm">
            <span>
              {scan.ticket.publicCode}
              <span className="mt-0.5 block text-xs text-paper-muted">
                {scan.ticket.holderName}
                {scan.staff?.name ? ` · ${scan.staff.name}` : ""}
              </span>
            </span>
            <span className="text-right text-paper-muted">
              {scanResultLabel(scan.result)}
              <span className="mt-0.5 block text-xs">{formatDate(scan.scannedAt, "d MMM HH:mm:ss")}</span>
            </span>
          </li>
        ))}
        {!event.scans.length ? (
          <li className="px-3 py-8 text-center text-sm text-paper-muted">Aucun scan pour le moment.</li>
        ) : null}
      </ul>
    </section>
  );
}
