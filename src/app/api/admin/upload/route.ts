import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/roles";
import { storeUploadedFile } from "@/lib/store-upload";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, message: "Choisissez un fichier." }, { status: 400 });
  }

  const result = await storeUploadedFile(file, String(formData.get("folder") || "media"));
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
