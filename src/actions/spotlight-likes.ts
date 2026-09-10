"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleSpotlightArtistLike(artistId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, message: "Connectez-vous pour aimer cet artiste." };
  }

  try {
    const artist = await prisma.spotlightArtist.findFirst({
      where: { id: artistId, visible: true },
      select: { id: true },
    });
    if (!artist) return { ok: false as const, message: "Cet artiste n’est plus disponible." };

    const where = { artistId: artist.id, userId: session.user.id };
    const existing = await prisma.spotlightArtistLike.findUnique({ where: { artistId_userId: where } });
    if (existing) {
      await prisma.spotlightArtistLike.delete({ where: { artistId_userId: where } });
    } else {
      await prisma.spotlightArtistLike.create({ data: where });
    }

    const count = await prisma.spotlightArtistLike.count({ where: { artistId: artist.id } });
    revalidatePath("/");
    return { ok: true as const, liked: !existing, count };
  } catch (error) {
    console.error("spotlight-like: unable to update", error);
    return { ok: false as const, message: "Les likes sont momentanément indisponibles. Réessayez dans un instant." };
  }
}
