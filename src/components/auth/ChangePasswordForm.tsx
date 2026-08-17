"use client";

import { useActionState } from "react";
import { changePasswordAction, type AuthActionState } from "@/actions/auth";
import { PasswordInput } from "@/components/auth/PasswordInput";

const initial: AuthActionState = { ok: false, message: "" };
const fieldClass =
  "auth-field w-full rounded-lg border border-line/80 bg-ink/60 px-4 py-3.5 text-paper placeholder:text-paper-muted/70 focus-ring";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);

  return (
    <form action={action} className="account-card mt-8 space-y-4 p-6">
      <div className="border-b border-line/70 pb-4">
        <h2 className="font-display text-xl uppercase">Sécurité</h2>
        <p className="mt-1 text-sm text-paper-muted">Mettez à jour votre mot de passe régulièrement.</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="currentPassword" className="auth-label">
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
        <label htmlFor="nextPassword" className="auth-label">
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
        <label htmlFor="confirmPassword" className="auth-label">
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
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "auth-error"}`}>{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-interactive inline-flex rounded-lg bg-ember px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-ember disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
