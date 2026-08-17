"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formOptionalId,
  formString,
  requireSuperAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ROLES, isRole } from "@/lib/roles";

const userSchema = z.object({
  name: z.string().min(2).max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format d'email invalide")
    .regex(/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/, "Format d'email invalide"),
  password: z.string().min(6).optional().or(z.literal("")),
  role: z.enum(ROLES),
});

async function countSuperAdmins(excludeId?: string) {
  return prisma.user.count({
    where: {
      role: "SUPERADMIN",
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function saveUser(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await requireSuperAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = userSchema.safeParse({
    name: formString(formData, "name"),
    email: formString(formData, "email").toLowerCase(),
    password: formString(formData, "password"),
    role: formString(formData, "role") || "USER",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!isRole(parsed.data.role)) {
    return { ok: false, message: "Rôle invalide." };
  }

  if (id) {
    const current = await prisma.user.findUnique({ where: { id } });
    if (!current) return { ok: false, message: "Utilisateur introuvable." };

    if (current.role === "SUPERADMIN" && parsed.data.role !== "SUPERADMIN") {
      const remaining = await countSuperAdmins(id);
      if (remaining < 1) {
        return { ok: false, message: "Il doit rester au moins un superadmin." };
      }
    }

    const clash = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (clash && clash.id !== id) {
      return { ok: false, message: "Cet email est déjà utilisé." };
    }

    const data: {
      name: string;
      email: string;
      role: string;
      passwordHash?: string;
    } = {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
    };

    if (parsed.data.password) {
      data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
    }

    await prisma.user.update({ where: { id }, data });
  } else {
    if (!parsed.data.password) {
      return { ok: false, message: "Le mot de passe est requis pour un nouveau compte." };
    }
    const clash = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (clash) return { ok: false, message: "Cet email est déjà utilisé." };

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        role: parsed.data.role,
      },
    });
  }

  void session;
  revalidatePath("/admin/users");
  return { ok: true, message: "Utilisateur enregistré." };
}

export async function deleteUser(formData: FormData) {
  const session = await requireSuperAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  if (id === session.user.id) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;
  if (target.role === "SUPERADMIN") {
    const remaining = await countSuperAdmins(id);
    if (remaining < 1) {
      throw new Error("Il doit rester au moins un superadmin.");
    }
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
