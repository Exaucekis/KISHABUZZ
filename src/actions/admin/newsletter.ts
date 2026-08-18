"use server";

import { revalidatePath } from "next/cache";
import { formString, requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function setNewsletterStatus(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const status = formString(formData, "status");
  if (!id || (status !== "ACTIVE" && status !== "UNSUBSCRIBED")) return;
  await prisma.newsletterSubscriber.update({ where: { id }, data: { status } });
  revalidatePath("/admin/newsletter");
}

export async function deleteNewsletterSubscriber(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/admin/newsletter");
}
