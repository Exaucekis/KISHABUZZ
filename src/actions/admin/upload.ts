"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { persistAdminFile } from "@/lib/admin-upload-store";
import { applyPublicWrites } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export type UploadResult = {
  ok: boolean;
  url?: string;
  message: string;
};

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choisissez un fichier." };
  }

  const result = await persistAdminFile(file, String(formData.get("folder") || "media"));
  if (result.ok && result.url) {
    try {
      await prisma.libraryFile.upsert({
        where: { url: result.url },
        create: {
          url: result.url,
          kind: result.kind || "IMAGE",
          title: file.name.replace(/\.[^.]+$/, ""),
          folder: result.folder || "media",
        },
        update: {},
      });
    } catch {
      /* la table sera créée par la migration ; l’upload reste valide */
    }
  }
  return { ok: result.ok, url: result.url, message: result.message };
}

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  if (!formData.get("folder")) formData.set("folder", "articles");
  const file = formData.get("file");
  if (file instanceof File && file.type.startsWith("video/")) {
    return { ok: false, message: "Formats acceptés : JPG, PNG, WebP, GIF." };
  }
  return uploadMedia(formData);
}

export type MediaAttachTarget = "event" | "article" | "settings" | "arenaShow";

const ATTACH_FIELDS: Record<MediaAttachTarget, ReadonlySet<string>> = {
  event: new Set(["poster"]),
  article: new Set(["coverImage"]),
  settings: new Set(["heroImage", "heroVideo"]),
  arenaShow: new Set(["poster", "videoUrl", "videoThumbnail"]),
};

export async function attachMediaUrl(input: {
  target: MediaAttachTarget;
  id?: string;
  field: string;
  url: string;
}): Promise<UploadResult> {
  await requireAdmin();
  const url = String(input.url || "").trim().slice(0, 2000);
  const field = String(input.field || "").trim();
  if (!ATTACH_FIELDS[input.target]?.has(field)) {
    return { ok: false, message: "Ce champ média ne peut pas être enregistré ainsi." };
  }

  try {
    if (input.target === "settings") {
      const data = field === "heroVideo" ? { heroVideo: url } : { heroImage: url };
      await prisma.siteSetting.upsert({
        where: { id: "main" },
        create: { id: "main", ...data },
        update: data,
      });
      revalidatePublicMedia("settings");
      return { ok: true, url, message: "C’est en ligne." };
    }

    const id = String(input.id || "").trim();
    if (!id) {
      return { ok: true, url, message: "Fichier prêt. Cliquez Enregistrer en bas du formulaire." };
    }

    if (input.target === "event") {
      const event = await prisma.event.update({
        where: { id },
        data: { poster: url },
        select: { slug: true },
      });
      revalidatePublicMedia("event", event.slug);
      return { ok: true, url, message: "C’est en ligne." };
    }

    if (input.target === "article") {
      const article = await prisma.article.update({
        where: { id },
        data: { coverImage: url },
        select: { slug: true, contentType: true },
      });
      revalidatePublicMedia("article", article.slug, article.contentType);
      return { ok: true, url, message: "C’est en ligne." };
    }

    const showData =
      field === "videoUrl"
        ? { videoUrl: url }
        : field === "videoThumbnail"
          ? { videoThumbnail: url }
          : { poster: url };
    const show = await prisma.arenaShow.update({
      where: { id },
      data: showData,
      select: { slug: true },
    });
    revalidatePublicMedia("arenaShow", show.slug);
    return { ok: true, url, message: "C’est en ligne." };
  } catch {
    return { ok: false, message: "Impossible d’enregistrer ce média sur la fiche." };
  }
}

function revalidatePublicMedia(kind: MediaAttachTarget, slug?: string, contentType?: string) {
  applyPublicWrites();
  revalidatePath("/", "layout");
  if (kind === "event") {
    revalidatePath("/evenements");
    revalidatePath("/admin/evenements");
    if (slug) revalidatePath(`/evenements/${slug}`);
  }
  if (kind === "article") {
    revalidatePath("/chroniques");
    revalidatePath("/publications");
    revalidatePath("/admin/articles");
    if (slug && contentType === "CHRONIQUE") revalidatePath(`/chroniques/${slug}`);
    if (slug) revalidatePath(`/publications/${slug}`);
  }
  if (kind === "settings") {
    revalidatePath("/admin/settings");
  }
  if (kind === "arenaShow") {
    revalidatePath("/arena-culture");
    revalidatePath("/arena-culture/emissions");
    revalidatePath("/admin/arena");
    if (slug) revalidatePath(`/arena-culture/emissions/${slug}`);
  }
}
