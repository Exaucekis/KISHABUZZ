"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formDate,
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { applyPublicWrites } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { normalizeCoverFocus } from "@/lib/cover-focus";
import { createSlug } from "@/lib/utils";

const portfolioSchema = z.object({
  title: z.string().min(2).max(220),
  description: z.string().optional().default(""),
  type: z.string().min(1),
  date: z.date().nullable().optional(),
  location: z.string().optional().default(""),
  client: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  coverAlt: z.string().max(300).optional().default(""),
  coverFocus: z.string().max(24).optional().default("50% 50%"),
  link: z.string().optional().default(""),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

async function uniquePortfolioSlug(base: string, excludeId?: string) {
  const slug = createSlug(base);
  let i = 0;
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await prisma.portfolioItem.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
  }
}

export async function savePortfolio(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = portfolioSchema.safeParse({
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    type: formString(formData, "type") || "MEDIA_ACTIVITY",
    date: formDate(formData, "date"),
    location: formString(formData, "location"),
    client: formString(formData, "client"),
    coverImage: formString(formData, "coverImage"),
    coverAlt: formString(formData, "coverAlt"),
    coverFocus: formString(formData, "coverFocus"),
    link: formString(formData, "link"),
    status: formString(formData, "status") || "DRAFT",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const slug = await uniquePortfolioSlug(parsed.data.title, id || undefined);
  const payload = {
    title: parsed.data.title,
    slug,
    description: parsed.data.description || "",
    type: parsed.data.type,
    date: parsed.data.date,
    location: parsed.data.location || "",
    client: parsed.data.client || "",
    coverImage: parsed.data.coverImage || "",
    coverAlt: parsed.data.coverAlt || "",
    coverFocus: normalizeCoverFocus(parsed.data.coverFocus),
    link: parsed.data.link || "",
    status: parsed.data.status,
  };

  const item = id
    ? await prisma.portfolioItem.update({ where: { id }, data: payload })
    : await prisma.portfolioItem.create({ data: payload });

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  applyPublicWrites();
  return { ok: true, message: "Élément enregistré.", id: item.id };
}

export async function deletePortfolio(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.portfolioItem.delete({ where: { id } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  applyPublicWrites();
}

export async function setPortfolioStatus(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const status = formString(formData, "status");
  if (!id || !status) return;
  await prisma.portfolioItem.update({ where: { id }, data: { status } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  applyPublicWrites();
}
