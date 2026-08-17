"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { revalidatePublic } from "@/lib/cache";
import {
  formBool,
  formDate,
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const mediaSchema = z.object({
  title: z.string().min(2).max(220),
  description: z.string().optional().default(""),
  kind: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().min(1, "URL requise"),
  thumbnail: z.string().optional().default(""),
  category: z.string().optional().default(""),
  visible: z.boolean(),
  date: z.date().nullable().optional(),
  arenaShowId: z.string().nullable().optional(),
  portfolioItemId: z.string().nullable().optional(),
  albumId: z.string().nullable().optional(),
});

export async function saveMedia(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = mediaSchema.safeParse({
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    kind: formString(formData, "kind") || "IMAGE",
    url: formString(formData, "url"),
    thumbnail: formString(formData, "thumbnail"),
    category: formString(formData, "category"),
    visible: formBool(formData, "visible"),
    date: formDate(formData, "date"),
    arenaShowId: formOptionalId(formData, "arenaShowId"),
    portfolioItemId: formOptionalId(formData, "portfolioItemId"),
    albumId: formOptionalId(formData, "albumId"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const payload = {
    title: parsed.data.title,
    description: parsed.data.description || "",
    kind: parsed.data.kind,
    url: parsed.data.url,
    thumbnail: parsed.data.thumbnail || "",
    category: parsed.data.category || "",
    visible: parsed.data.visible,
    date: parsed.data.date,
    arenaShowId: parsed.data.arenaShowId,
    portfolioItemId: parsed.data.portfolioItemId,
    albumId: parsed.data.albumId,
  };

  if (id) await prisma.mediaAsset.update({ where: { id }, data: payload });
  else await prisma.mediaAsset.create({ data: payload });

  revalidatePath("/admin/media");
  revalidatePath("/admin/arena/albums");
  revalidatePath("/arena-culture/photos");
  revalidatePath("/arena-culture/videos");
  revalidatePath("/arena-culture");
  revalidatePublic();
  return { ok: true, message: "Média enregistré." };
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
  revalidatePath("/arena-culture/photos");
  revalidatePath("/arena-culture/videos");
  revalidatePath("/arena-culture");
  revalidatePublic();
}
