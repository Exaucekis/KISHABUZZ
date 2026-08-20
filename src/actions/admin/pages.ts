"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { applyPublicWrites } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

const pageSchema = z.object({
  key: z.string().min(2).max(80),
  title: z.string().optional().default(""),
  body: z.string().optional().default(""),
});

export async function savePageContent(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = pageSchema.safeParse({
    key: formString(formData, "key") || createSlug(formString(formData, "title") || "page"),
    title: formString(formData, "title"),
    body: formString(formData, "body"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const payload = {
    key: parsed.data.key,
    title: parsed.data.title || "",
    body: parsed.data.body || "",
  };

  if (id) {
    await prisma.pageContent.update({ where: { id }, data: payload });
  } else {
    await prisma.pageContent.upsert({
      where: { key: payload.key },
      create: payload,
      update: payload,
    });
  }

  revalidatePath("/admin/pages");
  revalidatePath("/admin/settings");
  revalidatePath("/a-propos");
  applyPublicWrites();
  return { ok: true, message: "Page enregistrée. Elle s’affiche maintenant sur le site." };
}

export async function deletePageContent(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.pageContent.delete({ where: { id } });
  revalidatePath("/admin/pages");
  revalidatePath("/a-propos");
  applyPublicWrites();
}
