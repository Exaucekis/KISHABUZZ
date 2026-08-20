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
  const primaryGuestId = show?.guests[0]?.guestId || "";

  return (
    <form action={action} className="admin-card space-y-1">
      {show?.id ? <input type="hidden" name="id" value={show.id} /> : null}
      <input type="hidden" name="poster" value={show?.poster || ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
            Nouvelle émission
          </p>
          <p className="mt-1 text-sm text-[#9aa3b5]">
            Le titre et le nom de l’artiste s’affichent au-dessus de la vidéo. Pas d’affiche ici :
            seulement la vidéo, puis une photo miniature.
          </p>
        </div>
        <div className="admin-field md:col-span-2">
          <label htmlFor="title">Titre de l’émission</label>
          <input
            id="title"
            name="title"
            required
            defaultValue={show?.title || ""}
            placeholder="Ex. Arena Grand Culture — Live"
          />
          <AdminHint>Visible sous « Nouvelle émission », à côté du nom de l’artiste.</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label htmlFor="guestIds">Nom de l’artiste</label>
          <select id="guestIds" name="guestIds" defaultValue={primaryGuestId}>
            <option value="">— Choisir l’artiste —</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <AdminHint>
            Ce nom s’affiche sous le titre. Pas d’artiste dans la liste ?{" "}
            <Link href="/admin/arena/guests" className="text-amber-200 underline">
              Créez-le dans Invités
            </Link>
            .
          </AdminHint>
        </div>

        <div className="admin-card md:col-span-2 space-y-4 border-amber-400/25 bg-amber-400/5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
              Médias de l’émission — vidéo uniquement
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#c5ccd8]">
              Ici, <strong>pas de photo d’affiche</strong>. Deux fichiers seulement :
              <br />
              1. la <strong>vidéo</strong> (fichier MP4 ou lien YouTube / Facebook / Instagram / TikTok)
              <br />
              2. la <strong>photo miniature</strong> de cette vidéo (image avant le bouton lecture)
            </p>
          </div>
          <MediaField
            name="videoUrl"
            label="1. Vidéo de l’émission"
            defaultValue={show?.videoUrl || ""}
            kind="video"
            folder="media"
            dropzone
            hint="Déposez le fichier, ou collez un lien réseau. La vidéo passe en première ; l’ancienne va aux archives."
            persist={show?.id ? { target: "arenaShow", id: show.id, field: "videoUrl" } : undefined}
          />
          <MediaField
            name="videoThumbnail"
            label="2. Photo miniature de la vidéo (pas une affiche)"
            defaultValue={show?.videoThumbnail || ""}
            kind="image"
            folder="media"
            dropzone
            hint="Petite image affichée avant la lecture. Ce n’est pas l’affiche du prochain invité."
            persist={show?.id ? { target: "arenaShow", id: show.id, field: "videoThumbnail" } : undefined}
          />
        </div>

        <div className="admin-field md:col-span-2">
          <label htmlFor="status">Publication</label>
          <select id="status" name="status" defaultValue={show?.status || "PUBLISHED"}>
            <option value="DRAFT">Brouillon</option>
            <option value="SCHEDULED">Annoncer le prochain invité</option>
            <option value="PUBLISHED">Mettre la vidéo en première</option>
            <option value="ARCHIVED">Envoyer aux archives</option>
          </select>
          <AdminHint>
            « Mettre la vidéo en première » : titre + artiste + vidéo en haut de l’accueil et Arena.
            Le prochain invité (affiche) reste en dessous.
          </AdminHint>
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
        <div className="admin-field md:col-span-2">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" defaultValue={show?.description || ""} />
          <AdminHint>Présentation de l’épisode (invités, sujet).</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label>Autres invités (optionnel)</label>
          <div className="mt-1 grid max-h-48 gap-2 overflow-y-auto rounded-md border border-white/10 p-3 sm:grid-cols-2">
            {guests.map((g) => (
              <label key={g.id} className="admin-check text-sm text-[#eef1f6]">
                <input
                  type="checkbox"
                  name="guestIds"
                  value={g.id}
                  defaultChecked={selected.has(g.id) && g.id !== primaryGuestId}
                />
                {g.name}
              </label>
            ))}
            {!guests.length ? (
              <p className="text-sm text-[#9aa3b5]">Aucun invité — créez-en dans Invités.</p>
            ) : null}
          </div>
          <AdminHint>Cochez seulement s’il y a plusieurs personnes sur le plateau.</AdminHint>
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
