import { createUnsubscribeToken, isNewsletterEmail, normalizeNewsletterEmail } from "@/lib/newsletter";
import { formatWhatsAppDisplay, isValidWhatsAppPhone, toWhatsAppPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, formatDate } from "@/lib/utils";

export const ARENA_ALERT_KINDS = ["ANNOUNCE", "HEADLINE"] as const;
export type ArenaAlertKind = (typeof ARENA_ALERT_KINDS)[number];

export const MAX_ARENA_ALERT_RECIPIENTS = 400;

export function arenaAlertKindFromStatus(status: string): ArenaAlertKind | null {
  if (status === "SCHEDULED") return "ANNOUNCE";
  if (status === "PUBLISHED") return "HEADLINE";
  return null;
}

export function shouldDispatchArenaAlert(previous: string | null | undefined, next: string) {
  const kind = arenaAlertKindFromStatus(next);
  if (!kind) return false;
  return previous !== next;
}

export function normalizeArenaAlertEmail(raw: string) {
  return normalizeNewsletterEmail(raw);
}

export function parseArenaAlertSignup(input: { email?: string; whatsapp?: string }) {
  const emailRaw = normalizeArenaAlertEmail(input.email || "");
  const whatsappRaw = String(input.whatsapp || "").trim();
  const email = emailRaw && isNewsletterEmail(emailRaw) ? emailRaw : "";
  const whatsapp = whatsappRaw && isValidWhatsAppPhone(whatsappRaw) ? toWhatsAppPhone(whatsappRaw) : "";
  const errors: string[] = [];
  if (emailRaw && !email) errors.push("Indiquez un email valide.");
  if (whatsappRaw && !whatsapp) errors.push("Indiquez un numéro WhatsApp valide (ex. 0974 105 940).");
  if (!email && !whatsapp && !errors.length) {
    errors.push("Laissez au moins un email ou un numéro WhatsApp.");
  }
  return { email, whatsapp, errors };
}

export type ArenaAlertShowCopy = {
  title: string;
  slug: string;
  theme?: string | null;
  description?: string | null;
  airDate?: Date | string | null;
  airTime?: string | null;
  venueName?: string | null;
  guests?: { guest: { name: string } }[];
};

export function arenaAlertGuestNames(show: ArenaAlertShowCopy) {
  return (show.guests || [])
    .map((item) => String(item.guest?.name || "").trim())
    .filter(Boolean);
}

export function arenaAlertWhenLine(show: ArenaAlertShowCopy) {
  const date = formatDate(show.airDate, "EEEE d MMMM yyyy");
  const time = String(show.airTime || "").trim();
  return [date, time].filter(Boolean).join(" · ");
}

export function buildArenaAlertCopy(show: ArenaAlertShowCopy, kind: ArenaAlertKind) {
  const guests = arenaAlertGuestNames(show);
  const guestLine = guests.join(", ");
  const when = arenaAlertWhenLine(show);
  const place = String(show.venueName || "").trim();
  const url = absoluteUrl(`/arena-culture/emissions/${show.slug}`);
  const headline = guestLine || show.title;

  if (kind === "ANNOUNCE") {
    const subject = `Prochain invité Arena Culture : ${headline}`;
    const lines = [
      guestLine
        ? `Arena Culture annonce le prochain invité : ${guestLine}.`
        : `Arena Culture annonce la prochaine émission : ${show.title}.`,
      when ? `Rendez-vous ${when}.` : "",
      place ? `Lieu : ${place}.` : "",
      show.theme ? `Thème : ${show.theme}.` : "",
      `Tous les détails : ${url}`,
    ].filter(Boolean);
    return { subject, body: lines.join("\n\n"), url, headline };
  }

  const subject = `À la une Arena Culture : ${headline}`;
  const lines = [
    guestLine
      ? `${guestLine} est à la une d’Arena Culture.`
      : `${show.title} est à la une d’Arena Culture.`,
    when ? `Date : ${when}.` : "",
    place ? `Lieu : ${place}.` : "",
    `Voir l’émission : ${url}`,
  ].filter(Boolean);
  return { subject, body: lines.join("\n\n"), url, headline };
}

export function buildArenaAlertWhatsAppText(
  copy: { subject: string; body: string; url: string },
  unsubscribeUrl: string
) {
  return [`*${copy.subject}*`, copy.body, `Se désinscrire : ${unsubscribeUrl}`].join("\n\n");
}

export function arenaAlertUnsubscribeUrl(token: string) {
  return absoluteUrl(`/arena-culture/alertes/desinscription?token=${token}`);
}

export function formatArenaAlertChannels(row: {
  email?: string | null;
  emailStatus?: string;
  whatsapp?: string;
  whatsappStatus?: string;
}) {
  const parts: string[] = [];
  if (row.email && row.emailStatus === "ACTIVE") parts.push(row.email);
  if (row.whatsapp && row.whatsappStatus === "ACTIVE") {
    parts.push(formatWhatsAppDisplay(row.whatsapp));
  }
  return parts.join(" · ");
}

export async function upsertArenaAlertSubscriber(input: {
  email: string;
  whatsapp: string;
  source: string;
}) {
  const email = input.email || null;
  const whatsapp = input.whatsapp || "";
  const source = String(input.source || "arena").slice(0, 40) || "arena";

  const byEmail = email
    ? await prisma.arenaAlertSubscriber.findUnique({ where: { email } })
    : null;
  const byWhatsapp = whatsapp
    ? await prisma.arenaAlertSubscriber.findFirst({ where: { whatsapp } })
    : null;

  if (byEmail && byWhatsapp && byEmail.id !== byWhatsapp.id) {
    await prisma.arenaAlertSubscriber.delete({ where: { id: byWhatsapp.id } });
    return prisma.arenaAlertSubscriber.update({
      where: { id: byEmail.id },
      data: {
        whatsapp,
        emailStatus: "ACTIVE",
        whatsappStatus: "ACTIVE",
        source,
        unsubscribeToken: createUnsubscribeToken(),
      },
    });
  }

  const existing = byEmail || byWhatsapp;
  if (existing) {
    return prisma.arenaAlertSubscriber.update({
      where: { id: existing.id },
      data: {
        email: email || existing.email,
        whatsapp: whatsapp || existing.whatsapp,
        emailStatus: email ? "ACTIVE" : existing.emailStatus,
        whatsappStatus: whatsapp ? "ACTIVE" : existing.whatsappStatus,
        source,
        unsubscribeToken:
          existing.emailStatus === "UNSUBSCRIBED" || existing.whatsappStatus === "UNSUBSCRIBED"
            ? createUnsubscribeToken()
            : existing.unsubscribeToken,
      },
    });
  }

  return prisma.arenaAlertSubscriber.create({
    data: {
      email,
      whatsapp,
      emailStatus: email ? "ACTIVE" : "NONE",
      whatsappStatus: whatsapp ? "ACTIVE" : "NONE",
      source,
      unsubscribeToken: createUnsubscribeToken(),
    },
  });
}
