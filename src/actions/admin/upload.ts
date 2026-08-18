"use server";

import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/admin";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type UploadResult = {
  ok: boolean;
  url?: string;
  message: string;
};

function extensionFor(type: string, filename: string) {
  const fromName = path.extname(filename).toLowerCase();
  if (fromName === ".jpg" || fromName === ".jpeg" || fromName === ".png" || fromName === ".webp" || fromName === ".gif") {
    return fromName;
  }
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return ".jpg";
}

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choisissez une image." };
  }
  if (!ALLOWED.has(file.type)) {
    return { ok: false, message: "Formats acceptés : JPG, PNG, WebP, GIF." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Image trop lourde (4 Mo max)." };
  }

  const ext = extensionFor(file.type, file.name);
  const filename = `articles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    try {
      const blob = await put(filename, file, {
        access: "public",
        ...(process.env.BLOB_READ_WRITE_TOKEN
          ? { token: process.env.BLOB_READ_WRITE_TOKEN }
          : {}),
      });
      return { ok: true, url: blob.url, message: "Image envoyée." };
    } catch {
      return {
        ok: false,
        message: process.env.VERCEL
          ? "Échec de l’envoi vers Vercel Blob. Vérifiez le store Blob du projet."
          : "Échec de l’envoi vers Vercel Blob.",
      };
    }
  }

  const dir = path.join(process.cwd(), "public", "uploads", "articles");
  await mkdir(dir, { recursive: true });
  const localName = path.basename(filename);
  await writeFile(path.join(dir, localName), Buffer.from(await file.arrayBuffer()));
  return { ok: true, url: `/uploads/articles/${localName}`, message: "Image enregistrée." };
}
