"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formString, requireAdmin, type AdminActionState } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const staffRoleSchema = z.enum(["MANAGER", "SCANNER"]);

export async function addEventStaff(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const eventId = formString(formData, "eventId");
  const email = formString(formData, "email").toLowerCase();
  const role = staffRoleSchema.safeParse(formString(formData, "role") || "SCANNER");
  if (!eventId || !email) {
    return { ok: false, message: "Indiquez l’email d’un compte existant." };
  }
  if (!role.success) return { ok: false, message: "Rôle invalide." };

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (!user) return { ok: false, message: "Aucun compte avec cet email. La personne doit d’abord s’inscrire." };

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) return { ok: false, message: "Événement introuvable." };

  await prisma.eventStaff.upsert({
    where: { eventId_userId: { eventId, userId: user.id } },
    create: { eventId, userId: user.id, role: role.data },
    update: { role: role.data },
  });

  revalidatePath(`/admin/evenements/${eventId}`);
  return { ok: true, message: `${user.name} peut désormais contrôler l’entrée.` };
}

export async function removeEventStaff(formData: FormData): Promise<void> {
  await requireAdmin();
  const eventId = formString(formData, "eventId");
  const userId = formString(formData, "userId");
  if (!eventId || !userId) return;
  await prisma.eventStaff.deleteMany({ where: { eventId, userId } });
  revalidatePath(`/admin/evenements/${eventId}`);
}
