"use client";

import { useActionState } from "react";
import { unsubscribeNewsletter, type NewsletterActionState } from "@/actions/newsletter";

const initial: NewsletterActionState = { ok: false, message: "" };

export function UnsubscribeForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(unsubscribeNewsletter, initial);

  if (state.ok) {
    return <p className="text-paper">{state.message}</p>;
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <p className="text-paper-muted">Vous ne recevrez plus les messages de KISHA BUZZ.</p>
      <button
        type="submit"
        disabled={pending}
        className="bg-ember px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-ember disabled:opacity-60"
      >
        {pending ? "Patientez…" : "Confirmer la désinscription"}
      </button>
      {state.message ? <p className="text-sm text-red-400">{state.message}</p> : null}
    </form>
  );
}
