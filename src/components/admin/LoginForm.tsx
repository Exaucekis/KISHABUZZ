"use client";

import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitButton } from "@/components/admin/SubmitButton";

type State = { ok: boolean; message: string };

async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const callbackUrl = String(formData.get("callbackUrl") || "/admin");

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    return { ok: false, message: "Identifiants incorrects." };
  }

  return { ok: true, message: callbackUrl };
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [state, action] = useActionState(async (prev: State, formData: FormData) => {
    const result = await loginAction(prev, formData);
    if (result.ok) {
      router.push(result.message || "/admin");
      router.refresh();
    }
    return result;
  }, { ok: false, message: "" });

  return (
    <form action={action} className="admin-card w-full max-w-md">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="admin-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div className="admin-field">
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
        />
      </div>
      {!state.ok && state.message ? (
        <p className="mb-3 text-sm text-red-300">{state.message}</p>
      ) : null}
      <SubmitButton className="w-full">Se connecter</SubmitButton>
    </form>
  );
}
