"use client";

import { useActionState } from "react";
import { unsubscribeArenaAlert, type ArenaAlertActionState } from "@/actions/arena-alerts";

const initial: ArenaAlertActionState = { ok: false, message: "" };

export function ArenaAlertUnsubscribeForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(unsubscribeArenaAlert, initial);

  if (state.ok) {
    return <p className="text-paper">{state.message}</p>;
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <p className="text-paper-muted">
        Vous ne recevrez plus les alertes Arena Culture par email ni par WhatsApp.
      </p>
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
