"use client";

import { useActionState } from "react";
import { deleteArenaGuest, saveArenaGuest } from "@/actions/admin/arena";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Guest = {
  id: string;
  name: string;
  profession: string;
  bio: string;
  photo: string;
};

const initial: AdminActionState = { ok: false, message: "" };

function GuestForm({ guest }: { guest?: Guest }) {
  const [state, action] = useActionState(saveArenaGuest, initial);
  return (
    <form action={action} className="admin-card">
      {guest?.id ? <input type="hidden" name="id" value={guest.id} /> : null}
      <div className="admin-field">
        <label>Nom</label>
        <input name="name" required defaultValue={guest?.name || ""} />
        <AdminHint>Nom complet de l’invité, tel qu’affiché sur le site.</AdminHint>
      </div>
      <div className="admin-field">
        <label>Profession</label>
        <input name="profession" defaultValue={guest?.profession || ""} />
        <AdminHint>Métier ou titre. Ex. Artiste, Journaliste.</AdminHint>
      </div>
      <MediaField
        name="photo"
        label="Photo"
        defaultValue={guest?.photo || ""}
        kind="image"
        folder="guests"
        className="admin-field"
        hint="Portrait. Fichier ou lien. S’affiche sur Invités et les émissions."
      />
      <div className="admin-field">
        <label>Bio</label>
        <textarea name="bio" defaultValue={guest?.bio || ""} />
        <AdminHint>Courte présentation (quelques lignes).</AdminHint>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{guest ? "Mettre à jour" : "Créer"}</SubmitButton>
    </form>
  );
}

export function GuestsManager({ guests }: { guests: Guest[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouvel invité
        </h2>
        <GuestForm />
      </div>
      <div className="space-y-3">
        {guests.map((g) => (
          <div key={g.id} className="admin-card">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{g.name}</p>
                <p className="text-sm text-[#9aa3b5]">{g.profession || "—"}</p>
              </div>
              <form action={deleteArenaGuest}>
                <input type="hidden" name="id" value={g.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <GuestForm guest={g} />
          </div>
        ))}
        {!guests.length ? <p className="text-sm text-[#9aa3b5]">Aucun invité.</p> : null}
      </div>
    </div>
  );
}
