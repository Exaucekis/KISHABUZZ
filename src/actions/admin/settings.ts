"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { revalidatePublic } from "@/lib/cache";
import {
  formBool,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  siteTitle: z.string().min(2).max(120),
  tagline: z.string().optional().default(""),
  aboutShort: z.string().optional().default(""),
  aboutLong: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  address: z.string().optional().default(""),
  whatsappEnabled: z.boolean(),
  socialFacebook: z.string().optional().default(""),
  socialInstagram: z.string().optional().default(""),
  socialYoutube: z.string().optional().default(""),
  socialX: z.string().optional().default(""),
  socialTiktok: z.string().optional().default(""),
  metaTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
  heroImage: z.string().optional().default(""),
  heroVideo: z.string().optional().default(""),
});

export async function saveSettings(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    siteTitle: formString(formData, "siteTitle"),
    tagline: formString(formData, "tagline"),
    aboutShort: formString(formData, "aboutShort"),
    aboutLong: formString(formData, "aboutLong"),
    phone: formString(formData, "phone"),
    email: formString(formData, "email"),
    address: formString(formData, "address"),
    whatsappEnabled: formBool(formData, "whatsappEnabled"),
    socialFacebook: formString(formData, "socialFacebook"),
    socialInstagram: formString(formData, "socialInstagram"),
    socialYoutube: formString(formData, "socialYoutube"),
    socialX: formString(formData, "socialX"),
    socialTiktok: formString(formData, "socialTiktok"),
    metaTitle: formString(formData, "metaTitle"),
    metaDescription: formString(formData, "metaDescription"),
    heroImage: formString(formData, "heroImage"),
    heroVideo: formString(formData, "heroVideo"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.siteSetting.upsert({
    where: { id: "main" },
    create: { id: "main", ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/admin/settings");
  revalidatePublic();
  return { ok: true, message: "Paramètres enregistrés." };
}
