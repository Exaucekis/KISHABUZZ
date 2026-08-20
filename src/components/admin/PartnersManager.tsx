"use client";

import { useActionState } from "react";
import { deletePartner, savePartner } from "@/actions/admin/partners";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SaveResultFromState } from "@/components/admin/SaveResultDialog";
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
          <AdminHint>Nom officiel du partenaire.</AdminHint>
        </div>
        <MediaField
          name="logo"
          label="Logo"
          defaultValue={partner?.logo || ""}
          kind="logo"
          folder="logos"
          className="admin-field sm:col-span-2"
          hint="Logo du partenaire. Fichier PNG transparent, ou lien."
        />
        <div className="admin-field">
          <label>Site web</label>
          <input name="website" defaultValue={partner?.website || ""} />
          <AdminHint>URL complète, avec https://</AdminHint>
        </div>
        <div className="admin-field">
          <label>Projet</label>
          <input name="project" defaultValue={partner?.project || ""} />
          <AdminHint>Nom du projet commun, si besoin.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Ordre</label>
          <input name="order" type="number" defaultValue={partner?.order ?? 0} />
          <AdminHint>Plus le chiffre est petit, plus le partenaire est en haut.</AdminHint>
        </div>
        <div className="admin-field sm:col-span-2">
          <label>Description</label>
          <textarea name="description" defaultValue={partner?.description || ""} />
          <AdminHint>Quelques mots sur la collaboration.</AdminHint>
        </div>
        <div className="admin-field">
          <label className="admin-check">
            <input type="checkbox" name="visible" defaultChecked={partner?.visible ?? true} />
            Visible
          </label>
          <AdminHint>Décochez pour retirer le partenaire de la page publique.</AdminHint>
        </div>
      </div>
      {state.message && !state.ok ? (
        <p className="mb-2 text-sm text-red-300">{state.message}</p>
      ) : null}
      <SaveResultFromState state={state} titleOk="Partenaire enregistré" />
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
