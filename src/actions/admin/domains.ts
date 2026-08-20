"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formBool,
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { applyPublicWrites } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { idsMatch, nextOrder, rankedOrders } from "@/lib/reorder";
import { createSlug } from "@/lib/utils";

const domainSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  visible: z.boolean(),
});

function revalidateDomains() {
  revalidatePath("/admin/domains");
  revalidatePath("/a-propos");
  applyPublicWrites();
}

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
    visible: parsed.data.visible,
  };

  if (id) {
    await prisma.domain.update({ where: { id }, data: payload });
  } else {
    const max = await prisma.domain.aggregate({ _max: { order: true } });
    await prisma.domain.create({
      data: { ...payload, order: nextOrder(max._max.order) },
    });
  }

  revalidateDomains();
  return { ok: true, message: "Domaine enregistré." };
}

export async function reorderDomains(ids: string[]): Promise<AdminActionState> {
  await requireAdmin();
  const existing = await prisma.domain.findMany({ select: { id: true } });
  if (!ids.length || !idsMatch(ids, existing.map((row) => row.id))) {
    return { ok: false, message: "Liste incomplète. Rechargez la page." };
  }
  await prisma.$transaction(
    rankedOrders(ids).map(({ id, order }) => prisma.domain.update({ where: { id }, data: { order } }))
  );
  revalidateDomains();
  return { ok: true, message: "Ordre enregistré." };
}

export async function deleteDomain(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.domain.delete({ where: { id } });
  revalidateDomains();
}
