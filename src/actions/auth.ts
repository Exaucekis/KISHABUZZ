"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postLoginPath } from "@/lib/roles";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Format d'email invalide")
  .regex(/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/, "Format d'email invalide");

const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(6),
  callbackUrl: z.string().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(120),
  email: emailSchema,
  password: z.string().min(6, "Au moins 6 caractères"),
});

export type AuthActionState = {
  ok: boolean;
  message: string;
  redirectTo?: string;
  fieldErrors?: Record<string, string[]>;
};

function credentialsSignInError(result: string | undefined) {
  if (!result) return null;
  try {
    const url = new URL(result, "http://localhost");
    if (url.searchParams.get("error")) {
      return "Identifiants incorrects.";
    }
  } catch {
    return null;
  }
  return null;
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
    callbackUrl: String(formData.get("callbackUrl") || ""),
  });

  if (!parsed.success) {
    const emailError = parsed.error.flatten().fieldErrors.email?.[0];
    return {
      ok: false,
      message: emailError || "Email ou mot de passe invalide.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });

  const destination = postLoginPath(user?.role, parsed.data.callbackUrl || null);

  try {
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: destination,
      redirect: false,
    });

    const signInError = credentialsSignInError(typeof result === "string" ? result : undefined);
    if (signInError) {
      return { ok: false, message: signInError };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Identifiants incorrects." };
    }
    throw error;
  }

  return {
    ok: true,
    message: "Connecté.",
    redirectTo: destination,
  };
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) {
    return { ok: false, message: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "USER",
    },
  });

  try {
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/compte",
      redirect: false,
    });

    const signInError = credentialsSignInError(typeof result === "string" ? result : undefined);
    if (signInError) {
      return { ok: true, message: "Compte créé. Connectez-vous.", redirectTo: "/connexion" };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: true, message: "Compte créé. Connectez-vous.", redirectTo: "/connexion" };
    }
    throw error;
  }

  return { ok: true, message: "Compte créé.", redirectTo: "/compte" };
}

export async function changePasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Connectez-vous d’abord." };
  }

  const currentPassword = String(formData.get("currentPassword") || "");
  const nextPassword = String(formData.get("nextPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (nextPassword.length < 6) {
    return { ok: false, message: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  }
  if (nextPassword !== confirmPassword) {
    return { ok: false, message: "La confirmation ne correspond pas." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, message: "Compte introuvable." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { ok: false, message: "Mot de passe actuel incorrect." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(nextPassword, 12) },
  });

  return { ok: true, message: "Mot de passe mis à jour." };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/connexion" });
}
