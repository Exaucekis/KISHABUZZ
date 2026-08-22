import { put } from "@vercel/blob";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { prisma } from "@/lib/prisma";
import {
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  VIDEO_MAX_BYTES,
  VIDEO_TYPES,
  mediaExtension,
  mediaFolder,
  uniqueMediaName,
} from "@/lib/media-limits";

export type StoredUpload = {
  ok: boolean;
  url?: string;
  message: string;
};

async function writeLocalFile(folder: string, filename: string, file: File) {
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const localName = path.basename(filename);
  const dest = path.join(dir, localName);
  const body = file.stream();
  await pipeline(Readable.fromWeb(body as never), createWriteStream(dest));
  return `/uploads/${folder}/${localName}`;
}

export async function storeUploadedFile(file: File, folderRaw: string): Promise<StoredUpload> {
  const looksVideo =
    VIDEO_TYPES.has(file.type) ||
    file.type.startsWith("video/") ||
    /\.(mp4|webm|ogg|mov|m4v)$/i.test(file.name);
  const isImage = IMAGE_TYPES.has(file.type) || (!looksVideo && /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name));
  const isVideo = looksVideo;
  if (!isImage && !isVideo) {
    return { ok: false, message: "Formats acceptés : JPG, PNG, WebP, GIF, SVG, MP4, WebM." };
  }
  if (isImage && file.size > IMAGE_MAX_BYTES) {
    return { ok: false, message: "Image trop lourde (4 Mo max)." };
  }
  if (isVideo && file.size > VIDEO_MAX_BYTES) {
    return { ok: false, message: "Vidéo trop lourde (200 Mo max)." };
  }

  const folder = mediaFolder(folderRaw);
  const ext = mediaExtension(file.type, file.name);
  const filename = uniqueMediaName(folder, ext);

  let url = "";
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    try {
      const blob = await put(filename, file, {
        access: "public",
        multipart: isVideo || file.size > IMAGE_MAX_BYTES,
        ...(process.env.BLOB_READ_WRITE_TOKEN
          ? { token: process.env.BLOB_READ_WRITE_TOKEN }
          : {}),
      });
      url = blob.url;
    } catch (error) {
      console.error("[upload] blob", error instanceof Error ? error.message : error);
      return {
        ok: false,
        message: process.env.VERCEL
          ? "Échec de l’envoi vers Vercel Blob. Vérifiez que le store est Public et que BLOB_READ_WRITE_TOKEN est défini."
          : "Échec de l’envoi vers Vercel Blob.",
      };
    }
  } else {
    url = await writeLocalFile(folder, filename, file);
  }

  try {
    await prisma.libraryFile.upsert({
      where: { url },
      create: {
        url,
        kind: isVideo ? "VIDEO" : "IMAGE",
        title: file.name.replace(/\.[^.]+$/, ""),
        folder,
      },
      update: {},
    });
  } catch {
    /* la table sera créée par la migration ; l’upload reste valide */
  }

  return {
    ok: true,
    url,
    message: isVideo ? "Vidéo envoyée." : "Fichier enregistré.",
  };
}
