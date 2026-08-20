"use client";

import { useActionState } from "react";
import Link from "next/link";
import { subscribeArenaAlert, type ArenaAlertActionState } from "@/actions/arena-alerts";
import { EmailInput } from "@/components/auth/EmailInput";

const initial: ArenaAlertActionState = { ok: false, message: "" };

export function ArenaAlertForm({ source = "arena" }: { source?: string }) {
  const [state, action, pending] = useActionState(subscribeArenaAlert, initial);

  return (
    <form action={action} className="ac-alert__form" noValidate>
      <input type="hidden" name="source" value={source} />
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`arena-alert-website-${source}`}>Site web</label>
        <input id={`arena-alert-website-${source}`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="ac-alert__fields">
        <div>
          <label htmlFor={`arena-alert-email-${source}`}>Email</label>
          <EmailInput
            id={`arena-alert-email-${source}`}
            name="email"
            autoComplete="email"
            placeholder="vous@email.com"
            showHint={false}
            className="ac-alert__input"
          />
        </div>
        <div>
          <label htmlFor={`arena-alert-whatsapp-${source}`}>WhatsApp</label>
          <input
            id={`arena-alert-whatsapp-${source}`}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0974 105 940"
            className="ac-alert__input"
          />
        </div>
        <button type="submit" disabled={pending} className="ac-btn ac-btn--primary ac-alert__submit">
          {pending ? "Envoi…" : "M’alerter"}
        </button>
      </div>
      <p className="ac-alert__legal">
        Email, WhatsApp, ou les deux. Une alerte à l’annonce du prochain invité, une autre à la une.{" "}
        <Link href="/politique-de-confidentialite">Confidentialité</Link>.
      </p>
      {state.message ? (
        <p className={`ac-alert__status ${state.ok ? "is-ok" : "is-err"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
