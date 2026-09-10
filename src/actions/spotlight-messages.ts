"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formString, requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const messageSchema = z.string().trim().min(2, "Écrivez au moins 2 caractères.").max(1_000, "Le message ne peut pas dépasser 1 000 caractères.");

export async function sendSpotlightArtistMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/");

  const artistId = formString(formData, "artistId");
  const body = messageSchema.safeParse(formString(formData, "body"));
  if (!body.success || !artistId) return;

  const artist = await prisma.spotlightArtist.findFirst({
    where: { id: artistId, visible: true },
    select: { id: true, image: true },
  });
  if (!artist) return;

  await prisma.spotlightArtistMessage.create({
    data: {
      artistId: artist.id,
      userId: session.user.id,
      body: body.data,
      image: artist.image,
      sender: "USER",
    },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/compte/messages");
  redirect("/compte/messages");
}

export async function sendAdminSpotlightReply(formData: FormData) {
  const session = await requireAdmin();
  const artistId = formString(formData, "artistId");
  const userId = formString(formData, "userId");
  const body = messageSchema.safeParse(formString(formData, "body"));
  if (!body.success || !artistId || !userId) return;

  const [artist, user] = await Promise.all([
    prisma.spotlightArtist.findUnique({ where: { id: artistId }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
  ]);
  if (!artist || !user) return;

  await prisma.spotlightArtistMessage.create({
    data: {
      artistId,
      userId,
      body: body.data,
      sender: "ADMIN",
      adminName: session.user.name || "KISHA BUZZ",
    },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/compte/messages");
}
