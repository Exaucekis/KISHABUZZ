"use client";

import { useActionState } from "react";
import { changePasswordAction, type AuthActionState } from "@/actions/auth";
import { PasswordInput } from "@/components/auth/PasswordInput";

const initial: AuthActionState = { ok: false, message: "" };
const fieldClass = "w-full border border-line bg-ink-2 px-4 py-3 text-paper focus-ring";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);

  return (
    <form action={action} className="mt-8 space-y-4 border border-line bg-ink-2 p-6">
      <h2 className="font-display text-2xl">Changer le mot de passe</h2>
      <div className="space-y-2">
        <label htmlFor="currentPassword" className="block text-sm text-paper-muted">
          Mot de passe actuel
        </label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          required
          minLength={6}
          className={fieldClass}
          autoComplete="current-password"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="nextPassword" className="block text-sm text-paper-muted">
          Nouveau mot de passe
        </label>
        <PasswordInput
          id="nextPassword"
          name="nextPassword"
          required
          minLength={6}
          className={fieldClass}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm text-paper-muted">
          Confirmer
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          minLength={6}
          className={fieldClass}
          autoComplete="new-password"
        />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex rounded-md bg-ember px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-ember disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
