"use server";

import { headers } from "next/headers";
import {
  createUnsubscribeToken,
  isNewsletterEmail,
  normalizeNewsletterEmail,
} from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";

export type NewsletterActionState = {
  ok: boolean;
  message: string;
};

const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export async function subscribeNewsletter(
  _prev: NewsletterActionState,
  formData: FormData
): Promise<NewsletterActionState> {
  const honeypot = String(formData.get("website") || "").trim();
  if (honeypot) {
    return { ok: true, message: "Inscription confirmée. Merci." };
  }

  const email = normalizeNewsletterEmail(String(formData.get("email") || ""));
  const source = String(formData.get("source") || "footer").slice(0, 40) || "footer";

  if (!isNewsletterEmail(email)) {
    return { ok: false, message: "Indiquez un email valide." };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(`${ip}:${email}`)) {
    return { ok: false, message: "Trop de tentatives. Réessayez dans quelques minutes." };
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing?.status === "ACTIVE") {
    return { ok: true, message: "Vous êtes déjà inscrit." };
  }

  if (existing) {
    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: {
        status: "ACTIVE",
        source,
        unsubscribeToken: createUnsubscribeToken(),
      },
    });
    return { ok: true, message: "Réinscription confirmée. Merci." };
  }

  await prisma.newsletterSubscriber.create({
    data: {
      email,
      source,
      unsubscribeToken: createUnsubscribeToken(),
    },
  });

  return { ok: true, message: "Inscription confirmée. Merci." };
}

export async function unsubscribeNewsletter(
  _prev: NewsletterActionState,
  formData: FormData
): Promise<NewsletterActionState> {
  const token = String(formData.get("token") || "").trim();
  if (!token) return { ok: false, message: "Lien invalide." };

  const row = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  });
  if (!row) return { ok: false, message: "Lien invalide ou déjà utilisé." };
  if (row.status === "UNSUBSCRIBED") {
    return { ok: true, message: "Vous êtes déjà désinscrit." };
  }

  await prisma.newsletterSubscriber.update({
    where: { id: row.id },
    data: { status: "UNSUBSCRIBED" },
  });
  return { ok: true, message: "Désinscription confirmée." };
}
