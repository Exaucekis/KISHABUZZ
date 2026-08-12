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
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

const domainSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  order: z.number().int(),
  visible: z.boolean(),
});

export async function saveDomain(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = domainSchema.safeParse({
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    icon: formString(formData, "icon"),
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
  const clash = await prisma.domain.findUnique({ where: { slug } });
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36)}`;

  const payload = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description || "",
    icon: parsed.data.icon || "",
    order: parsed.data.order,
    visible: parsed.data.visible,
  };

  if (id) await prisma.domain.update({ where: { id }, data: payload });
  else await prisma.domain.create({ data: payload });

  revalidatePath("/admin/domains");
  return { ok: true, message: "Domaine enregistré." };
}

export async function deleteDomain(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.domain.delete({ where: { id } });
  revalidatePath("/admin/domains");
}
