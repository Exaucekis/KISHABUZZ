"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function markAdminNoticesRead() {
  await requireAdmin();
  await prisma.adminNotice.updateMany({
    where: { read: false },
    data: { read: true },
  });
  revalidatePath("/admin", "layout");
}
