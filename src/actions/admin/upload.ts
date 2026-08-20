"use server";

import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { applyPublicWrites } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

const IMAGE_MAX = 4 * 1024 * 1024;
const VIDEO_MAX = 80 * 1024 * 1024;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]);

const FOLDERS = new Set([
  "articles",
  "media",
  "logos",
  "covers",
  "guests",
  "albums",
  "artists",
  "settings",
  "icons",
]);

export type UploadResult = {
  ok: boolean;
  url?: string;
  message: string;
};

function extensionFor(type: string, filename: string) {
  const fromName = path.extname(filename).toLowerCase();
  if (
    [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".mp4", ".webm", ".ogg", ".mov"].includes(
      fromName
    )
  ) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  if (type === "image/svg+xml") return ".svg";
  if (type === "video/webm") return ".webm";
  if (type === "video/ogg") return ".ogg";
  if (type === "video/quicktime") return ".mov";
  return ".mp4";
}

function folderFrom(formData: FormData) {
  const raw = String(formData.get("folder") || "media").replace(/[^a-z]/gi, "");
  return FOLDERS.has(raw) ? raw : "media";
}

async function storeFile(folder: string, filename: string, file: File): Promise<UploadResult> {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    try {
      const blob = await put(filename, file, {
        access: "public",
        ...(process.env.BLOB_READ_WRITE_TOKEN
          ? { token: process.env.BLOB_READ_WRITE_TOKEN }
          : {}),
      });
      return { ok: true, url: blob.url, message: "Fichier envoyé." };
    } catch (error) {
      console.error("[upload] blob", error instanceof Error ? error.message : error);
      return {
        ok: false,
        message: process.env.VERCEL
          ? "Échec de l’envoi vers Vercel Blob. Vérifiez que le store est Public et que BLOB_READ_WRITE_TOKEN est défini."
          : "Échec de l’envoi vers Vercel Blob.",
      };
    }
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const localName = path.basename(filename);
  await writeFile(path.join(dir, localName), Buffer.from(await file.arrayBuffer()));
  return { ok: true, url: `/uploads/${folder}/${localName}`, message: "Fichier enregistré." };
}

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choisissez un fichier." };
  }

  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) {
    return { ok: false, message: "Formats acceptés : JPG, PNG, WebP, GIF, SVG, MP4, WebM." };
  }
  if (isImage && file.size > IMAGE_MAX) {
    return { ok: false, message: "Image trop lourde (4 Mo max)." };
  }
  if (isVideo && file.size > VIDEO_MAX) {
    return { ok: false, message: "Vidéo trop lourde (80 Mo max)." };
  }

  const folder = folderFrom(formData);
  const ext = extensionFor(file.type, file.name);
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const result = await storeFile(folder, filename, file);
  if (result.ok && result.url) {
    try {
      await prisma.libraryFile.upsert({
        where: { url: result.url },
        create: {
          url: result.url,
          kind: isVideo ? "VIDEO" : "IMAGE",
          title: file.name.replace(/\.[^.]+$/, ""),
          folder,
        },
        update: {},
      });
    } catch {
      /* la table sera créée par la migration ; l’upload reste valide */
    }
  }
  return result;
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
