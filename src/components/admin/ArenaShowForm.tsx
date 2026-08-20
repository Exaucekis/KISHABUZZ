"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveArenaShow } from "@/actions/admin/arena";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";
import { formatDate } from "@/lib/utils";

type Season = { id: string; title: string; number: number; year: number };
type Guest = { id: string; name: string };
type EventOption = { id: string; title: string; startsAt: Date; status: string };
type Show = {
  id: string;
  title: string;
  number: number;
  theme: string;
  description: string;
  airDate: Date | null;
  airTime: string;
  venueName: string;
  eventId: string | null;
  poster: string;
  videoUrl: string;
  videoThumbnail: string;
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
  events = [],
}: {
  show?: Show;
  seasons: Season[];
  guests: Guest[];
  events?: EventOption[];
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
          <AdminHint>Heure d’antenne, fuseau Lubumbashi. Ex. 20:00.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="venueName">Lieu</label>
          <input
            id="venueName"
            name="venueName"
            defaultValue={show?.venueName || ""}
            placeholder="Studio Arena Grand Culture, Lubumbashi"
          />
          <AdminHint>Visible sur le calendrier. Si vide, on reprend le lieu de l’événement billets.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="eventId">Billets (événement)</label>
          <select id="eventId" name="eventId" defaultValue={show?.eventId || ""}>
            <option value="">— Pas de billets —</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} · {formatDate(event.startsAt, "d MMM yyyy")} · {event.status}
              </option>
            ))}
          </select>
          <AdminHint>
            Lie un événement publié pour afficher « Prendre un billet » sur le calendrier Arena.
          </AdminHint>
        </div>
        <MediaField
          name="poster"
          label="Affiche"
          defaultValue={show?.poster || ""}
          kind="image"
          folder="covers"
          hint="Téléversez l’affiche : elle s’affiche tout de suite sur l’accueil et Arena."
          persist={show?.id ? { target: "arenaShow", id: show.id, field: "poster" } : undefined}
        />
        <MediaField
          name="videoUrl"
          label="Vidéo"
          defaultValue={show?.videoUrl || ""}
          kind="video"
          folder="media"
          hint="Lien YouTube / Instagram / TikTok, ou fichier."
          persist={show?.id ? { target: "arenaShow", id: show.id, field: "videoUrl" } : undefined}
        />
        <MediaField
          name="videoThumbnail"
          label="Miniature de la vidéo"
          defaultValue={show?.videoThumbnail || ""}
          kind="image"
          folder="media"
          hint="Image avant lecture. Si vide, YouTube fournit une miniature."
          persist={show?.id ? { target: "arenaShow", id: show.id, field: "videoThumbnail" } : undefined}
        />
        <div className="admin-field md:col-span-2">
          <label htmlFor="status">Publication</label>
          <select id="status" name="status" defaultValue={show?.status || "SCHEDULED"}>
            <option value="DRAFT">Brouillon</option>
            <option value="SCHEDULED">Annoncer le prochain invité</option>
            <option value="PUBLISHED">Publier à la une</option>
            <option value="ARCHIVED">Archives / rediffusion</option>
          </select>
          <AdminHint>
            Une seule affiche à la une, sur l’accueil et Arena. Modifiez l’émission actuelle pour
            changer l’affiche. « Annoncer » ou « Publier à la une » met celle-ci en première :
            l’ancienne passe aux archives. Alerte email + WhatsApp aux abonnés.
          </AdminHint>
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
          <AdminHint>Cochez les invités de cet épisode (créés dans Invités, puis publiés).</AdminHint>
        </div>
      </div>
      {!state.ok && state.message ? (
        <p className="text-sm text-red-300">{state.message}</p>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-3">
        <SubmitButton>Enregistrer</SubmitButton>
        <Link href="/admin/arena/emissions" className="admin-btn admin-btn-ghost">
          Retour
        </Link>
      </div>
    </form>
  );
}
