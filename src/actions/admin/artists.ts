"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formBool,
  formInt,
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { applyPublicWrites } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

const artistSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.string().optional().default(""),
  image: z.string().min(1, "Ajoutez une photo."),
  order: z.number().int(),
  visible: z.boolean(),
});

export async function saveSpotlightArtist(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = artistSchema.safeParse({
    name: formString(formData, "name"),
    role: formString(formData, "role"),
    image: formString(formData, "image"),
    order: formInt(formData, "order", 0),
    visible: formBool(formData, "visible"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let slug = createSlug(parsed.data.name);
  const clash = await prisma.spotlightArtist.findUnique({ where: { slug } });
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36)}`;

  const payload = {
    name: parsed.data.name,
    slug,
    role: parsed.data.role || "Artiste",
    image: parsed.data.image,
    order: parsed.data.order,
    visible: parsed.data.visible,
  };

  if (id) await prisma.spotlightArtist.update({ where: { id }, data: payload });
  else await prisma.spotlightArtist.create({ data: payload });

  revalidatePath("/admin/artists");
  revalidatePath("/");
  applyPublicWrites();
  return { ok: true, message: "Artiste enregistré. Il s’affiche maintenant sur l’accueil." };
}

export async function deleteSpotlightArtist(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.spotlightArtist.delete({ where: { id } });
  revalidatePath("/admin/artists");
  revalidatePath("/");
  applyPublicWrites();
}
