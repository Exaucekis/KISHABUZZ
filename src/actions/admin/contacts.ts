"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formString, requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const statusSchema = z.enum(["NEW", "IN_PROGRESS", "DONE", "ARCHIVED"]);

export async function updateContactStatus(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const status = statusSchema.parse(formString(formData, "status"));
  if (!id) return;
  await prisma.contactRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/contacts");
}

export async function deleteContact(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.contactRequest.delete({ where: { id } });
  revalidatePath("/admin/contacts");
}
