"use client";

import { useActionState } from "react";
import { deletePartner, savePartner } from "@/actions/admin/partners";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Partner = {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  project: string;
  visible: boolean;
  order: number;
};

const initial: AdminActionState = { ok: false, message: "" };

function PartnerForm({ partner }: { partner?: Partner }) {
  const [state, action] = useActionState(savePartner, initial);
  return (
    <form action={action} className="admin-card">
      {partner?.id ? <input type="hidden" name="id" value={partner.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="admin-field sm:col-span-2">
          <label>Nom</label>
          <input name="name" required defaultValue={partner?.name || ""} />
        </div>
        <div className="admin-field">
          <label>Logo (URL)</label>
          <input name="logo" defaultValue={partner?.logo || ""} />
        </div>
        <div className="admin-field">
          <label>Site web</label>
          <input name="website" defaultValue={partner?.website || ""} />
        </div>
        <div className="admin-field">
          <label>Projet</label>
          <input name="project" defaultValue={partner?.project || ""} />
        </div>
        <div className="admin-field">
          <label>Ordre</label>
          <input name="order" type="number" defaultValue={partner?.order ?? 0} />
        </div>
        <div className="admin-field sm:col-span-2">
          <label>Description</label>
          <textarea name="description" defaultValue={partner?.description || ""} />
        </div>
        <label className="admin-check admin-field">
          <input type="checkbox" name="visible" defaultChecked={partner?.visible ?? true} />
          Visible
        </label>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{partner ? "Mettre à jour" : "Créer"}</SubmitButton>
    </form>
  );
}

export function PartnersManager({ partners }: { partners: Partner[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouveau partenaire
        </h2>
        <PartnerForm />
      </div>
      <div className="space-y-3">
        {partners.map((p) => (
          <div key={p.id}>
            <div className="mb-2 flex justify-end px-1">
              <form action={deletePartner}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <PartnerForm partner={p} />
          </div>
        ))}
        {!partners.length ? <p className="text-sm text-[#9aa3b5]">Aucun partenaire.</p> : null}
      </div>
    </div>
  );
}
