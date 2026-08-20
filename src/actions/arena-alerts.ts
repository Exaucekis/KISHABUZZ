"use server";

import { headers } from "next/headers";
import { parseArenaAlertSignup, upsertArenaAlertSubscriber } from "@/lib/arena-alerts";
import { prisma } from "@/lib/prisma";

export type ArenaAlertActionState = {
  ok: boolean;
  message: string;
};

const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit = 6, windowMs = 15 * 60 * 1000) {
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

export async function subscribeArenaAlert(
  _prev: ArenaAlertActionState,
  formData: FormData
): Promise<ArenaAlertActionState> {
  const honeypot = String(formData.get("website") || "").trim();
  if (honeypot) {
    return { ok: true, message: "Inscription confirmée. Merci." };
  }

  const parsed = parseArenaAlertSignup({
    email: String(formData.get("email") || ""),
    whatsapp: String(formData.get("whatsapp") || ""),
  });
  if (parsed.errors.length) {
    return { ok: false, message: parsed.errors[0] };
  }

  const source = String(formData.get("source") || "arena").slice(0, 40) || "arena";
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(`${ip}:${parsed.email || parsed.whatsapp}`)) {
    return { ok: false, message: "Trop de tentatives. Réessayez dans quelques minutes." };
  }

  await upsertArenaAlertSubscriber({
    email: parsed.email,
    whatsapp: parsed.whatsapp,
    source,
  });

  if (parsed.email && parsed.whatsapp) {
    return { ok: true, message: "Inscription confirmée. Email et WhatsApp, c’est noté." };
  }
  if (parsed.whatsapp) {
    return { ok: true, message: "Numéro WhatsApp enregistré. Merci." };
  }
  return { ok: true, message: "Email enregistré. Merci." };
}

export async function unsubscribeArenaAlert(
  _prev: ArenaAlertActionState,
  formData: FormData
): Promise<ArenaAlertActionState> {
  const token = String(formData.get("token") || "").trim();
  if (!token) return { ok: false, message: "Lien invalide." };

  const row = await prisma.arenaAlertSubscriber.findUnique({
    where: { unsubscribeToken: token },
  });
  if (!row) return { ok: false, message: "Lien invalide ou déjà utilisé." };

  const already =
    (row.emailStatus === "UNSUBSCRIBED" || row.emailStatus === "NONE") &&
    (row.whatsappStatus === "UNSUBSCRIBED" || row.whatsappStatus === "NONE");
  if (already && (row.emailStatus === "UNSUBSCRIBED" || row.whatsappStatus === "UNSUBSCRIBED")) {
    return { ok: true, message: "Vous êtes déjà désinscrit des alertes Arena." };
  }

  await prisma.arenaAlertSubscriber.update({
    where: { id: row.id },
    data: {
      emailStatus: row.emailStatus === "ACTIVE" ? "UNSUBSCRIBED" : row.emailStatus,
      whatsappStatus: row.whatsappStatus === "ACTIVE" ? "UNSUBSCRIBED" : row.whatsappStatus,
    },
  });
  return { ok: true, message: "Désinscription confirmée. Plus d’alerte Arena par email ni WhatsApp." };
}
