"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { loginAction, type AuthActionState } from "@/actions/auth";
import { EmailInput } from "@/components/auth/EmailInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { cn } from "@/lib/utils";

const initial: AuthActionState = { ok: false, message: "" };

const siteFieldClass =
  "auth-field w-full rounded-lg border border-line/80 bg-ink/60 px-4 py-3.5 text-paper placeholder:text-paper-muted/70 focus-ring";

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

  const isSite = variant === "site";
  const wrap = isSite ? "auth-form space-y-5" : "admin-card w-full max-w-md";
  const inputClass = isSite ? siteFieldClass : undefined;
  const iconClass = "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-muted";

  return (
    <form action={action} className={wrap} noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className={isSite ? "space-y-2" : "admin-field"}>
        <label htmlFor="email" className="auth-label">
          Email
        </label>
        <div className="relative">
          {isSite ? <Mail className={iconClass} aria-hidden /> : null}
          <EmailInput
            id="email"
            name="email"
            required
            autoComplete="username"
            placeholder="vous@exemple.com"
            className={cn(inputClass, isSite && "pl-11")}
          />
        </div>
        {state.fieldErrors?.email?.[0] ? (
          <p className="auth-error">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className={isSite ? "space-y-2" : "admin-field"}>
        <label htmlFor="password" className="auth-label">
          Mot de passe
        </label>
        <div className="relative">
          {isSite ? <Lock className={iconClass} aria-hidden /> : null}
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={6}
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(inputClass, isSite && "pl-11")}
          />
        </div>
      </div>

      {!state.ok && state.message ? <p className="auth-error">{state.message}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className={
          isSite
            ? "btn-interactive btn-pulse auth-submit"
            : "admin-btn admin-btn-primary w-full disabled:opacity-60"
        }
      >
        <span>{pending ? "Connexion…" : "Se connecter"}</span>
        {!pending && isSite ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
      </button>
    </form>
  );
}
