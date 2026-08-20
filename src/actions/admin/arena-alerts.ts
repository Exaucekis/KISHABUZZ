"use server";

import { revalidatePath } from "next/cache";
import { formString, requireAdmin } from "@/lib/admin";
import { dispatchArenaAlert } from "@/lib/arena-alert-dispatch";
import { prisma } from "@/lib/prisma";
import type { ArenaAlertKind } from "@/lib/arena-alerts";

export async function setArenaAlertStatus(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const channel = formString(formData, "channel");
  const status = formString(formData, "status");
  if (!id || (status !== "ACTIVE" && status !== "UNSUBSCRIBED" && status !== "NONE")) return;
  if (channel === "email") {
    await prisma.arenaAlertSubscriber.update({ where: { id }, data: { emailStatus: status } });
  } else if (channel === "whatsapp") {
    await prisma.arenaAlertSubscriber.update({ where: { id }, data: { whatsappStatus: status } });
  }
  revalidatePath("/admin/arena/alertes");
}

export async function deleteArenaAlertSubscriber(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.arenaAlertSubscriber.delete({ where: { id } });
  revalidatePath("/admin/arena/alertes");
}

export async function resendArenaAlert(formData: FormData) {
  await requireAdmin();
  const showId = formString(formData, "showId");
  const kind = formString(formData, "kind") as ArenaAlertKind;
  if (!showId || (kind !== "ANNOUNCE" && kind !== "HEADLINE")) return;
  await dispatchArenaAlert(showId, kind, true);
  revalidatePath("/admin/arena/alertes");
  revalidatePath("/admin", "layout");
}
