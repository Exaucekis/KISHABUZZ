"use client";

import { useActionState } from "react";
import { deleteArenaSeason, saveArenaSeason } from "@/actions/admin/arena";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Season = {
  id: string;
  number: number;
  title: string;
  year: number;
  description: string;
};

const initial: AdminActionState = { ok: false, message: "" };

function SeasonForm({ season }: { season?: Season }) {
  const [state, action] = useActionState(saveArenaSeason, initial);
  return (
    <form action={action} className="admin-card">
      {season?.id ? <input type="hidden" name="id" value={season.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="admin-field">
          <label>Numéro</label>
          <input name="number" type="number" min={1} required defaultValue={season?.number ?? 1} />
          <AdminHint>Numéro de saison (1, 2, 3…).</AdminHint>
        </div>
        <div className="admin-field">
          <label>Année</label>
          <input
            name="year"
            type="number"
            required
            defaultValue={season?.year ?? new Date().getFullYear()}
          />
          <AdminHint>Année de la saison. Ex. 2026.</AdminHint>
        </div>
        <div className="admin-field sm:col-span-2">
          <label>Titre</label>
          <input name="title" required defaultValue={season?.title || ""} />
          <AdminHint>Nom public. Ex. Saison 1 — Arena Grand Culture.</AdminHint>
        </div>
        <div className="admin-field sm:col-span-2">
          <label>Description</label>
          <textarea name="description" defaultValue={season?.description || ""} />
          <AdminHint>Présentation courte de la saison (optionnel).</AdminHint>
        </div>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{season ? "Mettre à jour" : "Créer"}</SubmitButton>
    </form>
  );
}

export function SeasonsManager({ seasons }: { seasons: Season[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouvelle saison
        </h2>
        <SeasonForm />
      </div>
      <div className="space-y-3">
        {seasons.map((s) => (
          <div key={s.id} className="admin-card">
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="font-semibold">
                S{s.number} · {s.title} ({s.year})
              </p>
              <form action={deleteArenaSeason}>
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <SeasonForm season={s} />
          </div>
        ))}
        {!seasons.length ? <p className="text-sm text-[#9aa3b5]">Aucune saison.</p> : null}
      </div>
    </div>
  );
}
