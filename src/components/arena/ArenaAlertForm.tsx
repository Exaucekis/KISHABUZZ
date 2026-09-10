"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lock, Mail, MessageSquare, Send } from "lucide-react";
import { subscribeArenaAlert, type ArenaAlertActionState } from "@/actions/arena-alerts";
import { EmailInput } from "@/components/auth/EmailInput";

const initial: ArenaAlertActionState = { ok: false, message: "" };

export function ArenaAlertForm({ source = "arena" }: { source?: string }) {
  const [state, action, pending] = useActionState(subscribeArenaAlert, initial);

  return (
    <form action={action} className="mt-8 space-y-4" noValidate>
      <input type="hidden" name="source" value={source} />
      
      {/* Champ Honeypot anti-bot */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`arena-alert-website-${source}`}>Site web</label>
        <input id={`arena-alert-website-${source}`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
        {/* Champ Email */}
        <div className="sm:col-span-5">
          <label
            htmlFor={`arena-alert-email-${source}`}
            className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300/80"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email</span>
          </label>
          <EmailInput
            id={`arena-alert-email-${source}`}
            name="email"
            autoComplete="email"
            placeholder="votre@email.com"
            showHint={false}
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        {/* Champ WhatsApp */}
        <div className="sm:col-span-4">
          <label
            htmlFor={`arena-alert-whatsapp-${source}`}
            className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400/90"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </label>
          <input
            id={`arena-alert-whatsapp-${source}`}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0974 105 940"
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        {/* Bouton d'action M'alerter */}
        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={pending}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] hover:shadow-amber-500/40 disabled:opacity-50"
          >
            <Send className="h-4 w-4 fill-black text-black transition-transform group-hover:translate-x-0.5" />
            <span>{pending ? "Envoi…" : "M’alerter"}</span>
          </button>
        </div>
      </div>

      {/* Mention Légale & Confidentialité */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[0.78rem] text-white/50">
        <p className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-amber-400/70" />
          <span>Email, WhatsApp, ou les deux. Une alerte à l’annonce du prochain invité, une autre à la une.</span>
        </p>
        <Link
          href="/politique-de-confidentialite"
          className="font-semibold text-amber-400 hover:underline hover:text-amber-300"
        >
          Confidentialité
        </Link>
      </div>

      {/* Message d'état */}
      {state.message ? (
        <div
          className={`mt-3 rounded-xl p-3 text-xs font-semibold ${
            state.ok
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
