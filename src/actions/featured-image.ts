"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type FeaturedImageTargetType = "HOME_HERO" | "ARENA_PHOTO";

async function validTarget(targetType: FeaturedImageTargetType, targetId: string) {
  if (targetType === "HOME_HERO") {
    const setting = await prisma.siteSetting.findUnique({ where: { id: "main" }, select: { heroImage: true } });
    return Boolean(setting?.heroImage) && targetId === "main";
  }

  const photo = await prisma.mediaAsset.findFirst({
    where: { id: targetId, visible: true, kind: "IMAGE", albumId: { not: null } },
    select: { id: true },
  });
  return Boolean(photo);
}

export async function toggleFeaturedImageLike(targetType: FeaturedImageTargetType, targetId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, message: "Connectez-vous pour aimer cette image." };
  }
  if (!(await validTarget(targetType, targetId))) {
    return { ok: false as const, message: "Cette image n’est plus disponible." };
  }

  const where = { targetType, targetId, userId: session.user.id };
  const existing = await prisma.featuredImageLike.findUnique({ where: { targetType_targetId_userId: where } });
  if (existing) {
    await prisma.featuredImageLike.delete({ where: { targetType_targetId_userId: where } });
  } else {
    await prisma.featuredImageLike.create({ data: where });
  }

  const count = await prisma.featuredImageLike.count({ where: { targetType, targetId } });
  revalidatePath("/");
  revalidatePath("/arena-culture/photos");
  return { ok: true as const, liked: !existing, count };
}
