"use client";

import { useActionState } from "react";
import {
  deletePortfolio,
  savePortfolio,
  setPortfolioStatus,
} from "@/actions/admin/portfolio";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AdminActionState } from "@/lib/admin";
import { portfolioTypeLabel } from "@/lib/utils";

type Item = {
  id: string;
  title: string;
  description: string;
  type: string;
  date: Date | null;
  location: string;
  client: string;
  coverImage: string;
  coverAlt?: string;
  coverFocus?: string;
  link: string;
  status: string;
};

const TYPES = [
  "REPORTAGE",
  "INTERVIEW",
  "EVENT_COVERAGE",
  "PRODUCTION",
  "EMISSION",
  "MEDIA_ACTIVITY",
];

const initial: AdminActionState = { ok: false, message: "" };

function toDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function PortfolioForm({ item }: { item?: Item }) {
  const [state, action] = useActionState(savePortfolio, initial);
  return (
    <form action={action} className="admin-card">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="admin-field sm:col-span-2">
          <label>Titre</label>
          <input name="title" required defaultValue={item?.title || ""} />
          <AdminHint>Nom du projet / de la réalisation.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Type</label>
          <select name="type" defaultValue={item?.type || "MEDIA_ACTIVITY"}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {portfolioTypeLabel(t)}
              </option>
            ))}
          </select>
          <AdminHint>Classe le projet dans le portfolio public.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Statut</label>
          <select name="status" defaultValue={item?.status || "DRAFT"}>
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
          <AdminHint>Publiez pour l’afficher sur /portfolio.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Date</label>
          <input name="date" type="date" defaultValue={toDate(item?.date || null)} />
          <AdminHint>Date de la mission ou de la sortie.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Lieu</label>
          <input name="location" defaultValue={item?.location || ""} />
          <AdminHint>Ville ou lieu. Ex. Kinshasa.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Client</label>
          <input name="client" defaultValue={item?.client || ""} />
          <AdminHint>Nom du client ou de la marque (si public).</AdminHint>
        </div>
        <div className="admin-field">
          <label>Lien</label>
          <input name="link" defaultValue={item?.link || ""} />
          <AdminHint>Lien externe optionnel (vidéo, article, site).</AdminHint>
        </div>
        <MediaField
          name="coverImage"
          label="Couverture"
          defaultValue={item?.coverImage || ""}
          kind="image"
          folder="covers"
          altName="coverAlt"
          defaultAlt={item?.coverAlt || ""}
          focusName="coverFocus"
          defaultFocus={item?.coverFocus || "50% 50%"}
          hint="Image de une du projet. Recadrer pour garder le sujet visible."
        />
        <div className="admin-field sm:col-span-2">
          <label>Description</label>
          <textarea name="description" defaultValue={item?.description || ""} />
          <AdminHint>Ce qui a été fait : format, rôle, résultat.</AdminHint>
        </div>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{item ? "Mettre à jour" : "Créer"}</SubmitButton>
    </form>
  );
}

export function PortfolioManager({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouvel élément
        </h2>
        <PortfolioForm />
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <span className="text-sm text-[#9aa3b5]">{portfolioTypeLabel(item.type)}</span>
              </div>
              <div className="flex gap-1">
                {item.status !== "PUBLISHED" ? (
                  <form action={setPortfolioStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="PUBLISHED" />
                    <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                      Publier
                    </button>
                  </form>
                ) : (
                  <form action={setPortfolioStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="DRAFT" />
                    <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                      Dépublier
                    </button>
                  </form>
                )}
                <form action={deletePortfolio}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="admin-btn admin-btn-danger text-xs">
                    Suppr.
                  </button>
                </form>
              </div>
            </div>
            <PortfolioForm item={item} />
          </div>
        ))}
        {!items.length ? <p className="text-sm text-[#9aa3b5]">Aucun élément.</p> : null}
      </div>
    </div>
  );
}
