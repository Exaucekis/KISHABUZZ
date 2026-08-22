import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VIDEO_MAX_BYTES } from "@/lib/media-limits";
import { canAccessAdmin } from "@/lib/roles";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        access: "public",
        allowedContentTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/svg+xml",
          "video/mp4",
          "video/webm",
          "video/ogg",
          "video/quicktime",
          "video/x-m4v",
        ],
        addRandomSuffix: true,
        maximumSizeInBytes: VIDEO_MAX_BYTES,
      }),
      onUploadCompleted: async ({ blob }) => {
        const kind = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(blob.pathname || blob.url) ? "VIDEO" : "IMAGE";
        try {
          await prisma.libraryFile.upsert({
            where: { url: blob.url },
            create: {
              url: blob.url,
              kind,
              title: blob.pathname.split("/").pop() || "",
              folder: blob.pathname.split("/")[0] || "media",
            },
            update: {},
          });
        } catch {
          /* ignore si la migration n’est pas encore appliquée */
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec de l’envoi." },
      { status: 400 }
    );
  }
}
