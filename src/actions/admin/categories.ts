"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().optional().default(""),
  type: z.string().min(1).default("publication"),
});

export async function saveCategory(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = categorySchema.safeParse({
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    type: formString(formData, "type") || "publication",
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let slug = createSlug(parsed.data.name);
  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36)}`;

  const payload = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description || "",
    type: parsed.data.type,
  };

  if (id) await prisma.category.update({ where: { id }, data: payload });
  else await prisma.category.create({ data: payload });

  revalidatePath("/admin/categories");
  return { ok: true, message: "Catégorie enregistrée." };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
