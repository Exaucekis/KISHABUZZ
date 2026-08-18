"use client";

import { useActionState } from "react";
import { deleteDomain, reorderDomains, saveDomain } from "@/actions/admin/domains";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SortableOrderList } from "@/components/admin/SortableOrderList";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Domain = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  visible: boolean;
};

const initial: AdminActionState = { ok: false, message: "" };

function DomainForm({ domain }: { domain?: Domain }) {
  const [state, action] = useActionState(saveDomain, initial);
  return (
    <form action={action} className="admin-card">
      {domain?.id ? <input type="hidden" name="id" value={domain.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="admin-field sm:col-span-2">
          <label>Nom</label>
          <input name="name" required defaultValue={domain?.name || ""} />
          <AdminHint>Nom du domaine d’activité. Ex. Production, Communication.</AdminHint>
        </div>
        <MediaField
          name="icon"
          label="Icône"
          defaultValue={domain?.icon || ""}
          kind="icon"
          folder="icons"
          className="admin-field sm:col-span-2"
          hint="Cliquez une icône, ou téléversez une petite image. S’affiche sur l’accueil et À propos."
        />
        <div className="admin-field sm:col-span-2">
          <label>Description</label>
          <textarea name="description" defaultValue={domain?.description || ""} />
          <AdminHint>Une phrase sur ce que vous faites dans ce domaine.</AdminHint>
        </div>
        <div className="admin-field">
          <label className="admin-check">
            <input type="checkbox" name="visible" defaultChecked={domain?.visible ?? true} />
            Visible
          </label>
          <AdminHint>Décochez pour retirer le domaine du site, sans le supprimer.</AdminHint>
        </div>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{domain ? "Mettre à jour" : "Créer"}</SubmitButton>
    </form>
  );
}

export function DomainsManager({ domains }: { domains: Domain[] }) {
  return (
    <div className="space-y-6">
      {domains.length > 1 ? (
        <SortableOrderList
          items={domains.map((d) => ({
            id: d.id,
            label: d.name,
            hint: d.visible ? "Visible" : "Masqué",
          }))}
          onReorder={reorderDomains}
        />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouveau domaine
        </h2>
        <DomainForm />
      </div>
      <div className="space-y-3">
        {domains.map((d) => (
          <div key={d.id}>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <p className="text-sm text-[#9aa3b5]">{d.slug}</p>
              <form action={deleteDomain}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <DomainForm domain={d} />
          </div>
        ))}
        {!domains.length ? <p className="text-sm text-[#9aa3b5]">Aucun domaine.</p> : null}
      </div>
      </div>
    </div>
  );
}
