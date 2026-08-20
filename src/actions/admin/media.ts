"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { applyPublicWrites } from "@/lib/cache";
import {
  formBool,
  formDate,
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { applyArenaSpotlight } from "@/lib/arena-spotlight";
import { isPlayableMedia, videoPoster } from "@/lib/media";
import { prisma } from "@/lib/prisma";

const mediaSchema = z.object({
  title: z.string().min(2).max(220),
  description: z.string().optional().default(""),
  kind: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().min(1, "URL requise"),
  thumbnail: z.string().optional().default(""),
  alt: z.string().max(300).optional().default(""),
  category: z.string().optional().default(""),
  visible: z.boolean(),
  featured: z.boolean(),
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
    alt: formString(formData, "alt"),
    category: formString(formData, "category"),
    visible: formBool(formData, "visible"),
    featured: formBool(formData, "featured"),
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

  const kind =
    parsed.data.kind === "IMAGE" && isPlayableMedia(parsed.data.url) ? "VIDEO" : parsed.data.kind;
  const category = parsed.data.category || (kind === "VIDEO" ? "ARENA_CULTURE" : "");
  const thumbnail = parsed.data.thumbnail || videoPoster(parsed.data.url);

  if (parsed.data.featured && kind === "VIDEO" && formString(formData, "hasFeatured") === "1") {
    await prisma.mediaAsset.updateMany({
      where: {
        kind: "VIDEO",
        featured: true,
        ...(id ? { NOT: { id } } : {}),
      },
      data: { featured: false },
    });
  }

  const payload = {
    title: parsed.data.title,
    description: parsed.data.description || "",
    kind,
    url: parsed.data.url,
    thumbnail,
    alt: parsed.data.alt || "",
    category,
    visible: parsed.data.visible,
    date: parsed.data.date,
    portfolioItemId: parsed.data.portfolioItemId,
    albumId: parsed.data.albumId,
  };

  const manageFeatured = formString(formData, "hasFeatured") === "1";
  const manageShow = formData.has("arenaShowId");

  if (id) {
    await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...payload,
        ...(manageFeatured ? { featured: parsed.data.featured } : {}),
        ...(manageShow ? { arenaShowId: parsed.data.arenaShowId } : {}),
      },
    });
  } else {
    await prisma.mediaAsset.create({
      data: {
        ...payload,
        featured: manageFeatured ? parsed.data.featured : false,
        arenaShowId: manageShow ? parsed.data.arenaShowId : null,
      },
    });
  }

  if (manageFeatured && parsed.data.featured && kind === "VIDEO" && parsed.data.arenaShowId) {
    await prisma.arenaShow.update({
      where: { id: parsed.data.arenaShowId },
      data: {
        videoUrl: parsed.data.url,
        videoThumbnail: thumbnail,
      },
    });
    await applyArenaSpotlight(parsed.data.arenaShowId, "PUBLISHED");
  }

  revalidatePath("/admin/media");
  revalidatePath("/admin/arena");
  revalidatePath("/admin/arena/videos");
  revalidatePath("/admin/arena/albums");
  revalidatePath("/admin/arena/archives");
  revalidatePath("/arena-culture/photos");
  revalidatePath("/arena-culture/videos");
  revalidatePath("/arena-culture/archives");
  revalidatePath("/arena-culture");
  revalidatePath("/");
  applyPublicWrites();
  return { ok: true, message: "Média enregistré." };
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
  revalidatePath("/admin/arena");
  revalidatePath("/admin/arena/videos");
  revalidatePath("/arena-culture/photos");
  revalidatePath("/arena-culture/videos");
  revalidatePath("/arena-culture");
  applyPublicWrites();
}
