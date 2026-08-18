"use client";

import { useActionState } from "react";
import { deleteSpotlightArtist, saveSpotlightArtist } from "@/actions/admin/artists";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Artist = {
  id: string;
  name: string;
  role: string;
  image: string;
  visible: boolean;
  order: number;
};

const initial: AdminActionState = { ok: false, message: "" };

function ArtistForm({ artist }: { artist?: Artist }) {
  const [state, action] = useActionState(saveSpotlightArtist, initial);
  return (
    <form action={action} className="admin-card">
      {artist?.id ? <input type="hidden" name="id" value={artist.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="admin-field sm:col-span-2">
          <label>Nom</label>
          <input name="name" required defaultValue={artist?.name || ""} />
          <AdminHint>Nom affiché sur le bandeau d’accueil « Artistes à la une ».</AdminHint>
        </div>
        <div className="admin-field">
          <label>Rôle / titre</label>
          <input name="role" defaultValue={artist?.role || "Artiste"} />
          <AdminHint>Ex. Artiste, Légende, Chanteur. Si vide : Artiste.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Ordre</label>
          <input name="order" type="number" defaultValue={artist?.order ?? 0} />
          <AdminHint>Plus le chiffre est petit, plus l’artiste apparaît tôt dans le défilé.</AdminHint>
        </div>
        <MediaField
          name="image"
          label="Photo"
          defaultValue={artist?.image || ""}
          kind="image"
          folder="artists"
          className="admin-field sm:col-span-2"
          hint="Portrait ou photo de scène. Fichier, lien, ou Bibliothèque."
        />
        <div className="admin-field">
          <label className="admin-check">
            <input type="checkbox" name="visible" defaultChecked={artist?.visible ?? true} />
            Visible
          </label>
          <AdminHint>Décochez pour retirer l’artiste du bandeau d’accueil, sans le supprimer.</AdminHint>
        </div>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{artist ? "Mettre à jour" : "Créer"}</SubmitButton>
    </form>
  );
}

export function ArtistsManager({ artists }: { artists: Artist[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouvel artiste
        </h2>
        <ArtistForm />
      </div>
      <div className="space-y-3">
        {artists.map((artist) => (
          <div key={artist.id}>
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <p className="text-sm text-[#9aa3b5]">
                {artist.visible ? "Visible" : "Masqué"} · ordre {artist.order}
              </p>
              <form action={deleteSpotlightArtist}>
                <input type="hidden" name="id" value={artist.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <ArtistForm artist={artist} />
          </div>
        ))}
        {!artists.length ? <p className="text-sm text-[#9aa3b5]">Aucun artiste.</p> : null}
      </div>
    </div>
  );
}
