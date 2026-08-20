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
import { prisma } from "@/lib/prisma";
import { idsMatch, nextOrder, rankedOrders } from "@/lib/reorder";
import { createSlug } from "@/lib/utils";

const albumSchema = z.object({
  guestName: z.string().min(2).max(160),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  emissionLabel: z.string().optional().default("Arena Grand Culture"),
  date: z.date().nullable().optional(),
  visible: z.boolean(),
});

export async function savePhotoAlbum(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = albumSchema.safeParse({
    guestName: formString(formData, "guestName"),
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    coverImage: formString(formData, "coverImage"),
    emissionLabel: formString(formData, "emissionLabel") || "Arena Grand Culture",
    date: formDate(formData, "date"),
    visible: formBool(formData, "visible"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Veuillez corriger le formulaire album." };
  }

  const guestName = parsed.data.guestName;
  const title = parsed.data.title || `${guestName} · Arena Grand Culture`;
  const baseSlug = createSlug(guestName) || "invite";
  let slug = baseSlug;

  const existingSlug = await prisma.photoAlbum.findUnique({ where: { slug } });
  if (existingSlug && existingSlug.id !== id) {
    slug = `${baseSlug}-${Date.now().toString(36)}`;
  }

  const payload = {
    guestName,
    title,
    description: parsed.data.description || "",
    coverImage: parsed.data.coverImage || "",
    emissionLabel: parsed.data.emissionLabel || "Arena Grand Culture",
    date: parsed.data.date,
    visible: parsed.data.visible,
  };

  if (id) {
    await prisma.photoAlbum.update({
      where: { id },
      data: payload,
    });
  } else {
    const max = await prisma.photoAlbum.aggregate({ _max: { order: true } });
    await prisma.photoAlbum.create({
      data: { ...payload, slug, order: nextOrder(max._max.order) },
    });
  }

  revalidatePath("/admin/arena/albums");
  revalidatePath("/arena-culture/photos");
  revalidatePath("/arena-culture/albums");
  revalidatePath("/arena-culture");
  applyPublicWrites();
  return { ok: true, message: "Album enregistré." };
}

export async function reorderPhotoAlbums(ids: string[]): Promise<AdminActionState> {
  await requireAdmin();
  const existing = await prisma.photoAlbum.findMany({ select: { id: true } });
  if (!ids.length || !idsMatch(ids, existing.map((row) => row.id))) {
    return { ok: false, message: "Liste incomplète. Rechargez la page." };
  }
  await prisma.$transaction(
    rankedOrders(ids).map(({ id, order }) =>
      prisma.photoAlbum.update({ where: { id }, data: { order } })
    )
  );
  revalidatePath("/admin/arena/albums");
  revalidatePath("/arena-culture/photos");
  revalidatePath("/arena-culture/albums");
  revalidatePath("/arena-culture");
  applyPublicWrites();
  return { ok: true, message: "Ordre enregistré." };
}

export async function deletePhotoAlbum(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;

  await prisma.mediaAsset.updateMany({
    where: { albumId: id },
    data: { albumId: null },
  });
  await prisma.photoAlbum.delete({ where: { id } });

  revalidatePath("/admin/arena/albums");
  revalidatePath("/arena-culture/photos");
  revalidatePath("/arena-culture");
  applyPublicWrites();
}

export async function addPhotoToAlbum(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const albumId = formString(formData, "albumId");
  const title = formString(formData, "title");
  const url = formString(formData, "url");
  const description = formString(formData, "description");
  const alt = formString(formData, "alt");

  if (!albumId || !url || title.length < 2) {
    return { ok: false, message: "Titre et URL requis." };
  }

  const album = await prisma.photoAlbum.findUnique({ where: { id: albumId } });
  if (!album) return { ok: false, message: "Album introuvable." };

  await prisma.mediaAsset.create({
    data: {
      title,
      description,
      alt,
      kind: "IMAGE",
      url,
      thumbnail: url,
      category: "ARENA_CULTURE",
      visible: true,
      albumId,
    },
  });

  if (!album.coverImage) {
    await prisma.photoAlbum.update({
      where: { id: albumId },
      data: { coverImage: url },
    });
  }

  revalidatePath("/admin/arena/albums");
  revalidatePath(`/admin/arena/albums/${album.slug}`);
  revalidatePath("/arena-culture/photos");
  revalidatePath(`/arena-culture/albums/${album.slug}`);
  revalidatePath("/arena-culture");
  applyPublicWrites();
  return { ok: true, message: "Photo ajoutée à l'album." };
}

export async function removePhotoFromAlbum(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const albumSlug = formString(formData, "albumSlug");
  if (!id) return;
  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/arena/albums");
  if (albumSlug) {
    revalidatePath(`/admin/arena/albums/${albumSlug}`);
    revalidatePath(`/arena-culture/albums/${albumSlug}`);
  }
  revalidatePath("/arena-culture/photos");
  revalidatePath("/arena-culture");
  applyPublicWrites();
}

export async function setAlbumCover(formData: FormData) {
  await requireAdmin();
  const albumId = formString(formData, "albumId");
  const url = formString(formData, "url");
  const albumSlug = formString(formData, "albumSlug");
  if (!albumId || !url) return;
  await prisma.photoAlbum.update({
    where: { id: albumId },
    data: { coverImage: url },
  });
  revalidatePath("/admin/arena/albums");
  if (albumSlug) {
    revalidatePath(`/admin/arena/albums/${albumSlug}`);
    revalidatePath(`/arena-culture/albums/${albumSlug}`);
  }
  revalidatePath("/arena-culture/photos");
  revalidatePath("/arena-culture");
  applyPublicWrites();
}
