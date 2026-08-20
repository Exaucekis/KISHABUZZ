"use client";

import { useActionState } from "react";
import Link from "next/link";
import { subscribeNewsletter, type NewsletterActionState } from "@/actions/newsletter";
import { EmailInput } from "@/components/auth/EmailInput";

const initial: NewsletterActionState = { ok: false, message: "" };

export function NewsletterForm({
  source = "footer",
  compact = false,
  allowWhatsApp = false,
}: {
  source?: string;
  compact?: boolean;
  allowWhatsApp?: boolean;
}) {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  return (
    <form action={action} className={compact ? "space-y-3" : "space-y-4"} noValidate>
      <input type="hidden" name="source" value={source} />
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`newsletter-website-${source}`}>Site web</label>
        <input id={`newsletter-website-${source}`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={compact ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-3 sm:flex-row sm:items-stretch"}>
        <div className="min-w-0 flex-1">
          <label htmlFor={`newsletter-email-${source}`} className="sr-only">
            Email
          </label>
          <EmailInput
            id={`newsletter-email-${source}`}
            name="email"
            required
            autoComplete="email"
            placeholder="votre@email.com"
            showHint={false}
            className="border border-line bg-ink px-4 py-3 text-paper focus-ring"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 bg-ember px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-ember transition hover:bg-ember-hot disabled:opacity-60"
        >
          {pending ? "Envoi…" : "S’inscrire"}
        </button>
      </div>
      {allowWhatsApp ? (
        <div>
          <label htmlFor={`newsletter-whatsapp-${source}`} className="sr-only">
            WhatsApp (optionnel)
          </label>
          <input
            id={`newsletter-whatsapp-${source}`}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="WhatsApp (optionnel) — 0974 105 940"
            className="w-full border border-line bg-ink px-4 py-3 text-paper focus-ring"
          />
        </div>
      ) : null}
      <p className="text-xs leading-relaxed text-paper-muted">
        Actualités et chroniques, sans spam.{" "}
        <Link href="/politique-de-confidentialite" className="text-ember-text hover:underline">
          Politique de confidentialité
        </Link>
        .
      </p>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-300" : "text-red-400"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
