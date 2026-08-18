"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { buildCampaignHtml, buildCampaignText } from "@/lib/mail-template";
import { isMailerConfigured, mailerSetupHint, resolveMailFrom, sendMails } from "@/lib/mailer";
import {
  campaignNoticeCopy,
  campaignStatusFromCounts,
  isNewsletterEmail,
  MAX_CAMPAIGN_RECIPIENTS,
  parseRecipientList,
  summarizeRecipients,
} from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

const sendRate = new Map<string, { count: number; resetAt: number }>();

function checkSendRate(key: string, limit = 8, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = sendRate.get(key);
  if (!entry || entry.resetAt < now) {
    sendRate.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

const sendSchema = z.object({
  kind: z.enum(["NEWSLETTER", "NOTICE"]),
  audience: z.enum(["ALL", "CUSTOM"]),
  subject: z.string().min(3).max(160),
  body: z.string().min(8).max(8000),
  recipients: z.string().max(8000).optional().default(""),
  confirm: z.boolean(),
});

export async function setNewsletterStatus(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const status = formString(formData, "status");
  if (!id || (status !== "ACTIVE" && status !== "UNSUBSCRIBED")) return;
  await prisma.newsletterSubscriber.update({ where: { id }, data: { status } });
  revalidatePath("/admin/newsletter");
}

export async function deleteNewsletterSubscriber(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/admin/newsletter");
}

export async function sendNewsletterCampaign(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await requireAdmin();

  if (!isMailerConfigured()) {
    return { ok: false, message: mailerSetupHint() };
  }

  if (!checkSendRate(`admin-send:${session.user.id}`)) {
    return { ok: false, message: "Trop d’envois. Patientez quelques minutes." };
  }

  const parsed = sendSchema.safeParse({
    kind: formString(formData, "kind") || "NEWSLETTER",
    audience: formString(formData, "audience") || "ALL",
    subject: formString(formData, "subject"),
    body: formString(formData, "body"),
    recipients: formString(formData, "recipients"),
    confirm: formString(formData, "confirm") === "1",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifiez le sujet, le message et les destinataires.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { kind, audience, subject, body } = parsed.data;
  const settings = await prisma.siteSetting.findUnique({ where: { id: "main" } });
  const siteTitle = settings?.siteTitle || "KISHA BUZZ";
  const from = resolveMailFrom(settings?.email || "", siteTitle);
  if (!from) {
    return {
      ok: false,
      message: "Indiquez MAIL_FROM ou l’email du site dans Paramètres.",
    };
  }

  type Target = { email: string; unsubscribeUrl?: string };
  let targets: Target[] = [];

  if (audience === "ALL") {
    if (!parsed.data.confirm) {
      return { ok: false, message: "Confirmez l’envoi en masse avant de continuer." };
    }
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "ACTIVE" },
      select: { email: true, unsubscribeToken: true },
      orderBy: { createdAt: "asc" },
    });
    if (!subscribers.length) {
      return { ok: false, message: "Aucun abonné actif à qui envoyer." };
    }
    if (subscribers.length > MAX_CAMPAIGN_RECIPIENTS) {
      return {
        ok: false,
        message: `Trop d’abonnés pour un envoi unique (max ${MAX_CAMPAIGN_RECIPIENTS}). Exportez le CSV.`,
      };
    }
    targets = subscribers.map((row) => ({
      email: row.email,
      unsubscribeUrl: absoluteUrl(`/newsletter/desinscription?token=${row.unsubscribeToken}`),
    }));
  } else {
    const list = parseRecipientList(parsed.data.recipients);
    if (list.invalid.length) {
      return {
        ok: false,
        message: `Email invalide : ${list.invalid.slice(0, 5).join(", ")}`,
      };
    }
    if (!list.emails.length) {
      return { ok: false, message: "Indiquez au moins un email pour l’envoi personnalisé." };
    }
    if (list.emails.length > 5 && !parsed.data.confirm) {
      return { ok: false, message: "Confirmez l’envoi à plusieurs destinataires." };
    }
    if (list.emails.length > MAX_CAMPAIGN_RECIPIENTS) {
      return {
        ok: false,
        message: `Trop de destinataires (max ${MAX_CAMPAIGN_RECIPIENTS}).`,
      };
    }
    const known = await prisma.newsletterSubscriber.findMany({
      where: { email: { in: list.emails } },
      select: { email: true, unsubscribeToken: true },
    });
    const tokenByEmail = new Map(known.map((row) => [row.email, row.unsubscribeToken]));
    targets = list.emails.map((email) => {
      const token = tokenByEmail.get(email);
      return {
        email,
        unsubscribeUrl: token
          ? absoluteUrl(`/newsletter/desinscription?token=${token}`)
          : undefined,
      };
    });
  }

  const messages = targets.map((target) => ({
    to: target.email,
    subject,
    html: buildCampaignHtml({
      siteTitle,
      kind,
      subject,
      body,
      unsubscribeUrl: target.unsubscribeUrl,
    }),
    text: buildCampaignText(body, target.unsubscribeUrl),
  }));

  const result = await sendMails(from, messages);
  const status = campaignStatusFromCounts(result.sent, result.failed.length);
  const errorNote = result.failed
    .slice(0, 8)
    .map((item) => `${item.to}: ${item.error}`)
    .join(" · ");

  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subject,
      body,
      kind,
      audience,
      recipients:
        audience === "ALL" ? "ALL" : summarizeRecipients(targets.map((row) => row.email), 40),
      sentCount: result.sent,
      failCount: result.failed.length,
      status,
      errorNote,
      createdBy: session.user.email || session.user.name || session.user.id,
    },
  });

  const notice = campaignNoticeCopy(kind, subject, result.sent, result.failed.length);
  await prisma.adminNotice.create({
    data: {
      title: notice.title,
      body: notice.body,
      href: "/admin/newsletter",
    },
  });

  const notifyEmail = normalizeNotifyEmail(settings?.email || "");
  if (
    audience === "ALL" &&
    notifyEmail &&
    !targets.some((row) => row.email === notifyEmail)
  ) {
    await sendMails(from, [
      {
        to: notifyEmail,
        subject: `[KISHA BUZZ] ${notice.title}`,
        html: buildCampaignHtml({
          siteTitle,
          kind: "NOTICE",
          subject: notice.title,
          body: `${notice.body}\n\nCampagne : ${subject}`,
        }),
        text: buildCampaignText(`${notice.body}\n\nCampagne : ${subject}`),
      },
    ]);
  }

  revalidatePath("/admin/newsletter");
  revalidatePath("/admin", "layout");

  if (status === "FAILED") {
    return {
      ok: false,
      message: `Aucun message n’a pu être envoyé. ${errorNote || "Vérifiez Resend et MAIL_FROM."}`,
      id: campaign.id,
    };
  }

  return {
    ok: true,
    message: notice.body,
    id: campaign.id,
  };
}

function normalizeNotifyEmail(raw: string) {
  const email = String(raw || "").trim().toLowerCase();
  return isNewsletterEmail(email) ? email : "";
}
