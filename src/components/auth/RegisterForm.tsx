"use client";

import { useActionState, useEffect } from "react";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { registerAction, type AuthActionState } from "@/actions/auth";
import { EmailInput } from "@/components/auth/EmailInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { cn } from "@/lib/utils";

const initial: AuthActionState = { ok: false, message: "" };

const fieldClass =
  "auth-field w-full rounded-lg border border-line/80 bg-ink/60 px-4 py-3.5 text-paper placeholder:text-paper-muted/70 focus-ring";

const iconClass = "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-muted";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state]);

  return (
    <form action={action} className="auth-form space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="name" className="auth-label">
          Nom
        </label>
        <div className="relative">
          <User className={iconClass} aria-hidden />
          <input
            id="name"
            name="name"
            required
            minLength={2}
            autoComplete="name"
            placeholder="Votre nom"
            className={cn(fieldClass, "pl-11")}
          />
        </div>
        {state.fieldErrors?.name?.[0] ? <p className="auth-error">{state.fieldErrors.name[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="auth-label">
          Email
        </label>
        <div className="relative">
          <Mail className={iconClass} aria-hidden />
          <EmailInput
            id="email"
            name="email"
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
            className={cn(fieldClass, "pl-11")}
          />
        </div>
        {state.fieldErrors?.email?.[0] ? <p className="auth-error">{state.fieldErrors.email[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="auth-label">
          Mot de passe
        </label>
        <div className="relative">
          <Lock className={iconClass} aria-hidden />
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            className={cn(fieldClass, "pl-11")}
          />
        </div>
        {state.fieldErrors?.password?.[0] ? <p className="auth-error">{state.fieldErrors.password[0]}</p> : null}
      </div>

      {!state.ok && state.message ? <p className="auth-error">{state.message}</p> : null}

      <button type="submit" disabled={pending} className="btn-interactive btn-pulse auth-submit">
        <span>{pending ? "Création…" : "Créer mon compte"}</span>
        {!pending ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
      </button>
    </form>
  );
}
