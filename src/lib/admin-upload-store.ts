import { put } from "@vercel/blob";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

export const IMAGE_MAX = 4 * 1024 * 1024;
export const VIDEO_MAX = 80 * 1024 * 1024;

export const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
export const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]);

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

export type StoredUpload = {
  ok: boolean;
  url?: string;
  message: string;
  kind?: "IMAGE" | "VIDEO";
  folder?: string;
};

export function sanitizeUploadFolder(raw: string) {
  const folder = String(raw || "media").replace(/[^a-z]/gi, "");
  return FOLDERS.has(folder) ? folder : "media";
}

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

export function inspectUploadFile(file: File): StoredUpload & { kind?: "IMAGE" | "VIDEO" } {
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
  return { ok: true, message: "", kind: isVideo ? "VIDEO" : "IMAGE" };
}

async function storeLocal(folder: string, localName: string, file: File) {
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const dest = path.join(dir, localName);
  const webStream = file.stream();
  await pipeline(Readable.fromWeb(webStream as never), createWriteStream(dest));
  return `/uploads/${folder}/${localName}`;
}

export async function persistAdminFile(file: File, folderRaw = "media"): Promise<StoredUpload> {
  const inspected = inspectUploadFile(file);
  if (!inspected.ok || !inspected.kind) return inspected;

  const folder = sanitizeUploadFolder(folderRaw);
  const ext = extensionFor(file.type, file.name);
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    try {
      const blob = await put(filename, file, {
        access: "public",
        ...(process.env.BLOB_READ_WRITE_TOKEN
          ? { token: process.env.BLOB_READ_WRITE_TOKEN }
          : {}),
      });
      return {
        ok: true,
        url: blob.url,
        message: "Fichier envoyé.",
        kind: inspected.kind,
        folder,
      };
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

  try {
    const url = await storeLocal(folder, path.basename(filename), file);
    return { ok: true, url, message: "Fichier enregistré.", kind: inspected.kind, folder };
  } catch (error) {
    console.error("[upload] local", error instanceof Error ? error.message : error);
    return { ok: false, message: "Impossible d’enregistrer le fichier sur le serveur." };
  }
}
