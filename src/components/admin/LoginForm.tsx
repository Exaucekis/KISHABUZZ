"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type AuthActionState } from "@/actions/auth";

const initial: AuthActionState = { ok: false, message: "" };

const fieldClass =
  "w-full border border-line bg-ink-2 px-4 py-3 text-paper focus-ring";

export function LoginForm({
  callbackUrl = "",
  variant = "site",
}: {
  callbackUrl?: string;
  variant?: "site" | "admin";
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAction, initial);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  const wrap =
    variant === "admin"
      ? "admin-card w-full max-w-md"
      : "w-full max-w-md space-y-5 border border-line bg-ink-2 p-6";

  return (
    <form action={action} className={wrap}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className={variant === "admin" ? "admin-field" : "space-y-2"}>
        <label htmlFor="email" className="mb-2 block text-sm text-paper-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={variant === "admin" ? undefined : fieldClass}
        />
      </div>
      <div className={variant === "admin" ? "admin-field" : "space-y-2"}>
        <label htmlFor="password" className="mb-2 block text-sm text-paper-muted">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className={variant === "admin" ? undefined : fieldClass}
        />
      </div>
      {!state.ok && state.message ? (
        <p className="text-sm text-red-400">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={
          variant === "admin"
            ? "admin-btn admin-btn-primary w-full disabled:opacity-60"
            : "inline-flex w-full items-center justify-center rounded-md bg-ember px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-ember disabled:opacity-60"
        }
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
