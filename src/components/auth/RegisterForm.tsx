"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAction, type AuthActionState } from "@/actions/auth";

const initial: AuthActionState = { ok: false, message: "" };
const fieldClass = "w-full border border-line bg-ink-2 px-4 py-3 text-paper focus-ring";

export function RegisterForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerAction, initial);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="w-full max-w-md space-y-5 border border-line bg-ink-2 p-6">
      <div className="space-y-2">
        <label htmlFor="name" className="mb-2 block text-sm text-paper-muted">
          Nom
        </label>
        <input id="name" name="name" required minLength={2} className={fieldClass} autoComplete="name" />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-sm text-red-400">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="mb-2 block text-sm text-paper-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={fieldClass}
          autoComplete="email"
        />
        {state.fieldErrors?.email?.[0] ? (
          <p className="text-sm text-red-400">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="mb-2 block text-sm text-paper-muted">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className={fieldClass}
          autoComplete="new-password"
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-red-400">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>
      {!state.ok && state.message ? <p className="text-sm text-red-400">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-md bg-ember px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-ember disabled:opacity-60"
      >
        {pending ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
