"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveArenaShow } from "@/actions/admin/arena";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Season = { id: string; title: string; number: number; year: number };
type Guest = { id: string; name: string };
type Show = {
  id: string;
  title: string;
  number: number;
  theme: string;
  description: string;
  airDate: Date | null;
  airTime: string;
  poster: string;
  videoUrl: string;
  status: string;
  isFeatured: boolean;
  isGuestOfWeek: boolean;
  seasonId: string | null;
  guests: { guestId: string }[];
};

function toDateInput(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

const initial: AdminActionState = { ok: false, message: "" };

export function ArenaShowForm({
  show,
  seasons,
  guests,
}: {
  show?: Show;
  seasons: Season[];
  guests: Guest[];
}) {
  const [state, action] = useActionState(saveArenaShow, initial);
  const selected = new Set(show?.guests.map((g) => g.guestId) || []);

  return (
    <form action={action} className="admin-card space-y-1">
      {show?.id ? <input type="hidden" name="id" value={show.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="admin-field md:col-span-2">
          <label htmlFor="title">Titre</label>
          <input id="title" name="title" required defaultValue={show?.title || ""} />
          <AdminHint>Titre de l’émission, visible sur Arena Culture.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="number">Numéro</label>
          <input
            id="number"
            name="number"
            type="number"
            min={1}
            required
            defaultValue={show?.number ?? 1}
          />
          <AdminHint>Numéro d’épisode (1, 2, 3…).</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="seasonId">Saison</label>
          <select id="seasonId" name="seasonId" defaultValue={show?.seasonId || ""}>
            <option value="">— Aucune —</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                S{s.number} · {s.title} ({s.year})
              </option>
            ))}
          </select>
          <AdminHint>Rattachez l’épisode à une saison. Créez-la dans Saisons si besoin.</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label htmlFor="theme">Thème</label>
          <input id="theme" name="theme" defaultValue={show?.theme || ""} />
          <AdminHint>Sujet du jour. Ex. « Musique urbaine ».</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="airDate">Date</label>
          <input
            id="airDate"
            name="airDate"
            type="date"
            defaultValue={toDateInput(show?.airDate)}
          />
          <AdminHint>Date de diffusion ou d’enregistrement.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="airTime">Heure</label>
          <input id="airTime" name="airTime" defaultValue={show?.airTime || ""} placeholder="20:00" />
          <AdminHint>Heure d’antenne. Ex. 20:00.</AdminHint>
        </div>
        <MediaField
          name="poster"
          label="Affiche"
          defaultValue={show?.poster || ""}
          kind="image"
          folder="covers"
          hint="Visuel de l’émission (affiches, carte, replay). Fichier ou lien."
        />
        <MediaField
          name="videoUrl"
          label="Vidéo"
          defaultValue={show?.videoUrl || ""}
          kind="video"
          folder="media"
          hint="Replay : lien YouTube / Instagram / TikTok / Facebook, ou fichier."
        />
        <div className="admin-field">
          <label htmlFor="status">Statut</label>
          <select id="status" name="status" defaultValue={show?.status || "DRAFT"}>
            <option value="DRAFT">Brouillon</option>
            <option value="SCHEDULED">Programmé</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
          <AdminHint>Publiez pour afficher l’émission sur le site.</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" defaultValue={show?.description || ""} />
          <AdminHint>Présentation de l’épisode (invités, sujet).</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label>Invités</label>
          <div className="mt-1 grid max-h-48 gap-2 overflow-y-auto rounded-md border border-white/10 p-3 sm:grid-cols-2">
            {guests.map((g) => (
              <label key={g.id} className="admin-check text-sm text-[#eef1f6]">
                <input
                  type="checkbox"
                  name="guestIds"
                  value={g.id}
                  defaultChecked={selected.has(g.id)}
                />
                {g.name}
              </label>
            ))}
            {!guests.length ? (
              <p className="text-sm text-[#9aa3b5]">Aucun invité — créez-en dans Invités.</p>
            ) : null}
          </div>
          <AdminHint>Cochez les invités de cet épisode (créés dans Invités).</AdminHint>
        </div>
        <div className="admin-field">
          <label className="admin-check">
            <input type="checkbox" name="isFeatured" defaultChecked={show?.isFeatured || false} />
            Mise en avant
          </label>
          <AdminHint>Met l’émission en avant sur l’accueil Arena.</AdminHint>
        </div>
        <div className="admin-field">
          <label className="admin-check">
            <input
              type="checkbox"
              name="isGuestOfWeek"
              defaultChecked={show?.isGuestOfWeek || false}
            />
            Invité de la semaine
          </label>
          <AdminHint>Priorité « invité de la semaine » sur l’accueil.</AdminHint>
        </div>
      </div>
      {!state.ok && state.message ? (
        <p className="text-sm text-red-300">{state.message}</p>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-3">
        <SubmitButton>Enregistrer</SubmitButton>
        <Link href="/admin/arena" className="admin-btn admin-btn-ghost">
          Retour
        </Link>
      </div>
    </form>
  );
}
