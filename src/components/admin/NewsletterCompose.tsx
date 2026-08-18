"use client";

import { useActionState, useState } from "react";
import { sendNewsletterCampaign } from "@/actions/admin/newsletter";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

const initial: AdminActionState = { ok: false, message: "" };

export function NewsletterCompose({
  activeCount,
  mailerReady,
  mailerHint,
  defaultTo = "",
}: {
  activeCount: number;
  mailerReady: boolean;
  mailerHint: string;
  defaultTo?: string;
}) {
  const [state, action] = useActionState(sendNewsletterCampaign, initial);
  const [audience, setAudience] = useState(defaultTo ? "CUSTOM" : "ALL");

  return (
    <form action={action} className="admin-card">
      <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
        Composer un envoi
      </h2>
      <p className="admin-card-hint mb-4">
        Envoi en masse aux abonnés actifs, ou message personnalisé à un ou plusieurs emails.
      </p>

      {!mailerReady ? (
        <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {mailerHint}
        </p>
      ) : null}

      <div className="admin-field">
        <label>Type</label>
        <select name="kind" defaultValue="NEWSLETTER">
          <option value="NEWSLETTER">Newsletter</option>
          <option value="NOTICE">Notification</option>
        </select>
        <AdminHint>
          Newsletter pour un envoi éditorial. Notification pour une alerte courte.
        </AdminHint>
      </div>

      <div className="admin-field">
        <label>Destinataires</label>
        <div className="flex flex-wrap gap-3 text-sm text-[#eef1f6]">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="audience"
              value="ALL"
              checked={audience === "ALL"}
              onChange={() => setAudience("ALL")}
            />
            Tous les abonnés actifs ({activeCount})
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="audience"
              value="CUSTOM"
              checked={audience === "CUSTOM"}
              onChange={() => setAudience("CUSTOM")}
            />
            Emails précis
          </label>
        </div>
      </div>

      {audience === "CUSTOM" ? (
        <div className="admin-field">
          <label htmlFor="newsletter-recipients">Emails</label>
          <textarea
            id="newsletter-recipients"
            name="recipients"
            rows={3}
            defaultValue={defaultTo}
            placeholder="un@mail.com, deux@mail.com"
          />
          <AdminHint>Séparez les adresses par une virgule, un espace ou un saut de ligne.</AdminHint>
        </div>
      ) : (
        <input type="hidden" name="recipients" value="" />
      )}

      <div className="admin-field">
        <label htmlFor="newsletter-subject">Sujet</label>
        <input id="newsletter-subject" name="subject" required maxLength={160} />
      </div>

      <div className="admin-field">
        <label htmlFor="newsletter-body">Message</label>
        <textarea id="newsletter-body" name="body" rows={8} required maxLength={8000} />
        <AdminHint>Texte simple. Les sauts de ligne sont conservés dans l’email.</AdminHint>
      </div>

      <div className="admin-field">
        <label className="flex items-start gap-2 text-sm text-[#eef1f6]">
          <input type="checkbox" name="confirm" value="1" className="mt-1 w-auto" />
          <span>
            Je confirme l’envoi
            {audience === "ALL" ? ` à ${activeCount} abonné${activeCount > 1 ? "s" : ""}` : ""}.
          </span>
        </label>
      </div>

      {state.message ? (
        <p className={`mb-3 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Envoi…" disabled={!mailerReady}>
        Envoyer
      </SubmitButton>
    </form>
  );
}
