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

const partnerSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().optional().default(""),
  logo: z.string().optional().default(""),
  website: z.string().optional().default(""),
  project: z.string().optional().default(""),
  visible: z.boolean(),
  order: z.number().int(),
});

export async function savePartner(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = partnerSchema.safeParse({
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    logo: formString(formData, "logo"),
    website: formString(formData, "website"),
    project: formString(formData, "project"),
    visible: formBool(formData, "visible"),
    order: formInt(formData, "order", 0),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let slug = createSlug(parsed.data.name);
  const clash = await prisma.partner.findUnique({ where: { slug } });
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36)}`;

  const payload = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description || "",
    logo: parsed.data.logo || "",
    website: parsed.data.website || "",
    project: parsed.data.project || "",
    visible: parsed.data.visible,
    order: parsed.data.order,
  };

  if (id) await prisma.partner.update({ where: { id }, data: payload });
  else await prisma.partner.create({ data: payload });

  revalidatePath("/admin/partners");
  revalidatePath("/collaborations");
  applyPublicWrites();
  return { ok: true, message: "Partenaire enregistré." };
}

export async function deletePartner(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.partner.delete({ where: { id } });
  revalidatePath("/admin/partners");
  revalidatePath("/collaborations");
  applyPublicWrites();
}
