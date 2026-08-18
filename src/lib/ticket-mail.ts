import { escapeHtml } from "@/lib/mail-template";
import { formatMoney } from "@/lib/events";
import { isMailerConfigured, resolveMailFrom, sendMails } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, formatDate } from "@/lib/utils";

export async function sendOrderPaidEmail(orderId: string) {
  if (!isMailerConfigured()) return;

  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: {
      event: { select: { title: true, slug: true, startsAt: true, venueName: true, city: true } },
      items: { include: { ticketType: { select: { name: true } } } },
      tickets: { select: { publicCode: true, holderName: true, ticketType: { select: { name: true } } } },
    },
  });
  if (!order || order.status !== "PAID") return;

  const settings = await prisma.siteSetting.findUnique({ where: { id: "main" } });
  const siteTitle = settings?.siteTitle || "KISHA BUZZ";
  const from = resolveMailFrom(settings?.email || "", siteTitle);
  if (!from) return;

  const billetsUrl = absoluteUrl("/compte/billets");
  const eventUrl = absoluteUrl(`/evenements/${order.event.slug}`);
  const lines = order.items
    .map((item) => `${item.quantity} × ${item.ticketType.name} — ${formatMoney(item.unitPrice * item.quantity, order.currency)}`)
    .join("\n");
  const codes = order.tickets.map((ticket) => ticket.publicCode).join(", ");

  const text = [
    `Bonjour ${order.buyerName},`,
    "",
    `Votre paiement pour « ${order.event.title} » est confirmé.`,
    `Commande ${order.orderNumber} — ${formatMoney(order.amount, order.currency)}.`,
    formatDate(order.event.startsAt, "EEEE d MMMM yyyy · HH:mm"),
    [order.event.venueName, order.event.city].filter(Boolean).join(" · "),
    "",
    lines,
    codes ? `Codes billets : ${codes}` : "",
    "",
    `Vos billets : ${billetsUrl}`,
    `Événement : ${eventUrl}`,
    "",
    siteTitle,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f3f4f6;">
    <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
      <div style="background:#0d1017;color:#fff;padding:18px 24px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#f4a261;">Billet</p>
        <p style="margin:6px 0 0;font-size:22px;font-weight:700;">${escapeHtml(siteTitle)}</p>
      </div>
      <div style="background:#fff;padding:28px 24px 24px;">
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#0d1017;">Paiement confirmé</h1>
        <p style="margin:0 0 16px;color:#1f2430;font-size:16px;line-height:1.6;">
          Bonjour ${escapeHtml(order.buyerName)}, votre commande
          <strong>${escapeHtml(order.orderNumber)}</strong> pour
          <strong>${escapeHtml(order.event.title)}</strong> est payée.
        </p>
        <p style="margin:0 0 16px;color:#1f2430;font-size:16px;line-height:1.6;">
          ${escapeHtml(formatDate(order.event.startsAt, "EEEE d MMMM yyyy · HH:mm"))}<br />
          ${escapeHtml([order.event.venueName, order.event.city].filter(Boolean).join(" · "))}<br />
          ${escapeHtml(formatMoney(order.amount, order.currency))}
        </p>
        <p style="margin:0 0 24px;">
          <a href="${escapeHtml(billetsUrl)}" style="display:inline-block;background:#e85d04;color:#fff;text-decoration:none;padding:12px 18px;font-weight:700;">Voir mes billets</a>
        </p>
        <p style="margin:0;font-size:13px;color:#6b7280;">Codes : ${escapeHtml(codes || "disponibles dans votre compte")}</p>
      </div>
    </div>
  </body>
</html>`;

  await sendMails(from, [
    {
      to: order.buyerEmail,
      subject: `Billets confirmés — ${order.event.title}`,
      html,
      text,
    },
  ]);
}
