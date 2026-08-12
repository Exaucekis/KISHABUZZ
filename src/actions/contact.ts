"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const COLLAB_TYPES = [
  "MEDIA",
  "EVENT_COVERAGE",
  "INTERVIEW",
  "PARTNERSHIP",
  "ADVERTISING",
  "ARENA_CULTURE",
  "CONTENT_PRODUCTION",
  "OTHER",
] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis").max(120),
  organization: z.string().trim().max(160).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  email: z.string().trim().email("Email invalide").max(160),
  subject: z.string().trim().min(3, "Le sujet est requis").max(200),
  collaborationType: z.enum(COLLAB_TYPES),
  message: z.string().trim().min(10, "Le message est trop court").max(5000),
});

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

export type ContactActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const raw = {
    name: String(formData.get("name") || ""),
    organization: String(formData.get("organization") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    subject: String(formData.get("subject") || ""),
    collaborationType: String(formData.get("collaborationType") || "OTHER"),
    message: String(formData.get("message") || ""),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger les champs indiqués.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const rateKey = parsed.data.email.toLowerCase();
  if (!checkRateLimit(rateKey)) {
    return {
      ok: false,
      message: "Trop de demandes. Réessayez dans quelques minutes.",
    };
  }

  await prisma.contactRequest.create({
    data: {
      name: parsed.data.name,
      organization: parsed.data.organization,
      phone: parsed.data.phone,
      email: parsed.data.email,
      subject: parsed.data.subject,
      collaborationType: parsed.data.collaborationType,
      message: parsed.data.message,
      status: "NEW",
    },
  });

  return {
    ok: true,
    message: "Votre demande a bien été envoyée. Nous vous répondrons rapidement.",
  };
}
