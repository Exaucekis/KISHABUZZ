"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const commentSchema = z.string().trim().min(2, "Écrivez au moins 2 caractères.").max(800, "Votre commentaire ne peut pas dépasser 800 caractères.");
const commentRateMap = new Map<string, { count: number; resetAt: number }>();

export type ArenaCommentActionState = {
  ok: boolean;
  message: string;
  comment?: { id: string; content: string; createdAt: string; authorName: string };
};

async function activeShow(showId: string) {
  return prisma.arenaShow.findFirst({
    where: { id: showId, status: { in: ["PUBLISHED", "SCHEDULED"] } },
    select: { id: true, slug: true },
  });
}

function mayComment(key: string) {
  const now = Date.now();
  const entry = commentRateMap.get(key);
  if (!entry || entry.resetAt < now) {
    commentRateMap.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count += 1;
  return true;
}

export async function toggleArenaShowLike(showId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, message: "Connectez-vous pour aimer cette émission." };
  }

  const show = await activeShow(showId);
  if (!show) return { ok: false as const, message: "Cette émission n’est plus disponible." };

  const existing = await prisma.arenaShowLike.findUnique({
    where: { showId_userId: { showId, userId: session.user.id } },
  });
  if (existing) {
    await prisma.arenaShowLike.delete({ where: { showId_userId: { showId, userId: session.user.id } } });
  } else {
    await prisma.arenaShowLike.create({ data: { showId, userId: session.user.id } });
  }

  const count = await prisma.arenaShowLike.count({ where: { showId } });
  revalidatePath("/arena-culture");
  revalidatePath(`/arena-culture/emissions/${show.slug}`);
  return { ok: true as const, liked: !existing, count };
}

export async function addArenaShowComment(
  _previous: ArenaCommentActionState,
  formData: FormData
): Promise<ArenaCommentActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connectez-vous pour laisser un commentaire." };
  }

  const showId = String(formData.get("showId") || "");
  const parsed = commentSchema.safeParse(String(formData.get("content") || ""));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Commentaire invalide." };

  const show = await activeShow(showId);
  if (!show) return { ok: false, message: "Cette émission n’est plus disponible." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!mayComment(`${session.user.id}:${ip}`)) {
    return { ok: false, message: "Trop de commentaires envoyés. Réessayez dans quelques minutes." };
  }

  const comment = await prisma.arenaShowComment.create({
    data: { showId, userId: session.user.id, content: parsed.data },
    select: { id: true, content: true, createdAt: true, user: { select: { name: true } } },
  });

  revalidatePath("/arena-culture");
  revalidatePath(`/arena-culture/emissions/${show.slug}`);
  return {
    ok: true,
    message: "Votre commentaire a été publié.",
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      authorName: comment.user.name || "Membre",
    },
  };
}
