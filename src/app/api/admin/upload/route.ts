import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { persistAdminFile } from "@/lib/admin-upload-store";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/roles";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Choisissez un fichier." }, { status: 400 });
  }

  const result = await persistAdminFile(file, String(formData.get("folder") || "media"));
  if (!result.ok || !result.url) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: 400 }
    );
  }

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
    /* l’upload reste valide sans bibliothèque */
  }

  return NextResponse.json({ ok: true, url: result.url, message: result.message });
}
