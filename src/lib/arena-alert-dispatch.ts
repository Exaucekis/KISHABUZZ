import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  arenaAlertKindFromStatus,
  arenaAlertUnsubscribeUrl,
  arenaAlertWhenLine,
  buildArenaAlertCopy,
  buildArenaAlertWhatsAppText,
  MAX_ARENA_ALERT_RECIPIENTS,
  shouldDispatchArenaAlert,
  type ArenaAlertKind,
} from "@/lib/arena-alerts";
import { buildCampaignHtml, buildCampaignText } from "@/lib/mail-template";
import { isMailerConfigured, resolveMailFrom, sendMails } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { isWhatsAppConfigured, sendWhatsAppAlerts, whatsappSetupHint } from "@/lib/whatsapp";

async function claimDispatch(showId: string, kind: ArenaAlertKind, force: boolean) {
  if (force) {
    const existing = await prisma.arenaAlertDispatch.findUnique({
      where: { showId_kind: { showId, kind } },
    });
    if (existing) {
      return prisma.arenaAlertDispatch.update({
        where: { id: existing.id },
        data: { status: "PENDING", errorNote: "", emailSent: 0, emailFailed: 0, whatsappSent: 0, whatsappFailed: 0 },
      });
    }
  }

  try {
    return await prisma.arenaAlertDispatch.create({
      data: { showId, kind, status: "PENDING" },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }
    throw error;
  }
}

export async function dispatchArenaAlert(showId: string, kind: ArenaAlertKind, force = false) {
  const claimed = await claimDispatch(showId, kind, force);
  if (!claimed) return null;

  const show = await prisma.arenaShow.findUnique({
    where: { id: showId },
    include: { guests: { include: { guest: { select: { name: true } } } } },
  });

  if (!show) {
    await prisma.arenaAlertDispatch.update({
      where: { id: claimed.id },
      data: { status: "FAILED", errorNote: "Émission introuvable." },
    });
    return claimed;
  }

  const copy = buildArenaAlertCopy(show, kind);
  const when = arenaAlertWhenLine(show);
  const notes: string[] = [];

  const emailRows = await prisma.arenaAlertSubscriber.findMany({
    where: { emailStatus: "ACTIVE", email: { not: null } },
    select: { email: true, unsubscribeToken: true },
    orderBy: { createdAt: "asc" },
    take: MAX_ARENA_ALERT_RECIPIENTS,
  });

  let emailSent = 0;
  let emailFailed = 0;

  if (!emailRows.length) {
    notes.push("Aucun email abonné.");
  } else if (!isMailerConfigured()) {
    emailFailed = emailRows.length;
    notes.push("Resend non configuré : emails non envoyés.");
  } else {
    const settings = await prisma.siteSetting.findUnique({ where: { id: "main" } });
    const siteTitle = settings?.siteTitle || "KISHA BUZZ";
    const from = resolveMailFrom(settings?.email || "", siteTitle);
    if (!from) {
      emailFailed = emailRows.length;
      notes.push("MAIL_FROM manquant : emails non envoyés.");
    } else {
      const messages = emailRows
        .filter((row) => row.email)
        .map((row) => {
          const unsubscribeUrl = arenaAlertUnsubscribeUrl(row.unsubscribeToken);
          return {
            to: row.email as string,
            subject: copy.subject,
            html: buildCampaignHtml({
              siteTitle,
              kind: "NOTICE",
              subject: copy.subject,
              body: copy.body,
              unsubscribeUrl,
            }),
            text: buildCampaignText(copy.body, unsubscribeUrl),
          };
        });
      const result = await sendMails(from, messages);
      emailSent = result.sent;
      emailFailed = result.failed.length;
      if (result.failed.length) {
        notes.push(
          result.failed
            .slice(0, 6)
            .map((item) => `${item.to}: ${item.error}`)
            .join(" · ")
        );
      }
    }
  }

  const whatsappRows = await prisma.arenaAlertSubscriber.findMany({
    where: { whatsappStatus: "ACTIVE", whatsapp: { not: "" } },
    select: { whatsapp: true, unsubscribeToken: true },
    orderBy: { createdAt: "asc" },
    take: MAX_ARENA_ALERT_RECIPIENTS,
  });

  let whatsappSent = 0;
  let whatsappFailed = 0;

  if (!whatsappRows.length) {
    notes.push("Aucun numéro WhatsApp abonné.");
  } else if (!isWhatsAppConfigured()) {
    whatsappFailed = whatsappRows.length;
    notes.push(whatsappSetupHint());
  } else {
    const result = await sendWhatsAppAlerts(
      whatsappRows.map((row) => ({
        to: row.whatsapp,
        kind,
        text: buildArenaAlertWhatsAppText(copy, arenaAlertUnsubscribeUrl(row.unsubscribeToken)),
        headline: copy.headline,
        when: when || "Bientôt",
        url: copy.url,
      }))
    );
    whatsappSent = result.sent;
    whatsappFailed = result.failed.length;
    if (result.failed.length) {
      notes.push(
        result.failed
          .slice(0, 6)
          .map((item) => `${item.to}: ${item.error}`)
          .join(" · ")
      );
    }
  }

  const failed = emailFailed + whatsappFailed;
  const sent = emailSent + whatsappSent;
  const noAudience = !emailRows.length && !whatsappRows.length;
  const status = noAudience
    ? "SKIPPED"
    : sent === 0 && failed > 0
      ? "FAILED"
      : failed > 0
        ? "PARTIAL"
        : "SENT";

  const updated = await prisma.arenaAlertDispatch.update({
    where: { id: claimed.id },
    data: {
      emailSent,
      emailFailed,
      whatsappSent,
      whatsappFailed,
      status,
      errorNote: notes.join(" · ").slice(0, 1800),
    },
  });

  const label = kind === "ANNOUNCE" ? "Annonce invité" : "À la une";
  const title =
    status === "FAILED"
      ? `Échec d’alerte Arena (${label.toLowerCase()})`
      : status === "PARTIAL"
        ? `Alerte Arena partielle (${label.toLowerCase()})`
        : status === "SKIPPED"
          ? `Alerte Arena sans abonné (${label.toLowerCase()})`
          : `Alerte Arena envoyée (${label.toLowerCase()})`;

  await prisma.adminNotice.create({
    data: {
      title,
      body: `« ${show.title} » — ${emailSent} email${emailSent > 1 ? "s" : ""}, ${whatsappSent} WhatsApp. ${updated.errorNote}`.trim(),
      href: "/admin/arena/alertes",
    },
  });

  revalidatePath("/admin/arena/alertes");
  revalidatePath("/admin", "layout");

  return updated;
}

export function queueArenaAlert(
  showId: string,
  previousStatus: string | null | undefined,
  nextStatus: string,
  force = false
) {
  if (!force && !shouldDispatchArenaAlert(previousStatus, nextStatus)) return;
  const kind = arenaAlertKindFromStatus(nextStatus);
  if (!kind) return;
  after(() => {
    void dispatchArenaAlert(showId, kind, force).catch((error) => {
      console.error("arena alert dispatch failed", error);
    });
  });
}
