"use client";

import { useActionState } from "react";
import Link from "next/link";
import { archiveArenaShow, deleteArenaShow, saveArenaShow } from "@/actions/admin/arena";
import { AdminConfirmForm } from "@/components/admin/AdminConfirmForm";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Guest = { id: string; name: string; profession: string };
type DomainOption = { id: string; name: string };
type Show = {
  id: string;
  title: string;
  theme: string;
  poster: string;
  videoUrl: string;
  videoThumbnail: string;
  status: string;
  number: number;
  seasonId: string | null;
  venueName: string;
  eventId: string | null;
  description: string;
  guests: { guestId: string }[];
};

const initial: AdminActionState = { ok: false, message: "" };

export function ArenaShowForm({
  show,
  guests,
  domains = [],
}: {
  show?: Show;
  guests: Guest[];
  domains?: DomainOption[];
}) {
  const [state, action] = useActionState(saveArenaShow, initial);
  const primary = guests.find((guest) => guest.id === show?.guests[0]?.guestId);
  const guestName = primary?.name || "";
  const domain = show?.theme || primary?.profession || "";

  return (
    <div className="space-y-4">
      <form action={action} className="admin-card space-y-1">
        {show?.id ? <input type="hidden" name="id" value={show.id} /> : null}
        <input type="hidden" name="poster" value={show?.poster || ""} />
        <input type="hidden" name="status" value={show?.status === "ARCHIVED" ? "ARCHIVED" : "PUBLISHED"} />
        {show?.number ? <input type="hidden" name="number" value={show.number} /> : null}
        {show?.seasonId ? <input type="hidden" name="seasonId" value={show.seasonId} /> : null}
        <input type="hidden" name="venueName" value={show?.venueName || ""} />
        {show?.eventId ? <input type="hidden" name="eventId" value={show.eventId} /> : null}
        <input type="hidden" name="description" value={show?.description || ""} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
              {show?.id ? "Modifier l’émission" : "Nouvelle émission"}
            </p>
            <p className="mt-1 text-sm text-[#9aa3b5]">
              Ici seulement : nom de l’invité, thème, vidéo, miniature. Pas d’affiche. L’émission
              est lancée tout de suite. Le prochain invité se gère dans son onglet.
            </p>
          </div>

          <div className="admin-field">
            <label htmlFor="guestName">Nom de l’invité</label>
            <input
              id="guestName"
              name="guestName"
              required
              list="arena-show-guests"
              defaultValue={guestName}
              placeholder="Ex. Fally Ipupa"
            />
            <datalist id="arena-show-guests">
              {guests.map((guest) => (
                <option key={guest.id} value={guest.name} />
              ))}
            </datalist>
            <AdminHint>
              Tapez le nom, ou choisissez un invité déjà créé. Un nouveau nom crée la fiche
              automatiquement.{" "}
              <Link href="/admin/arena/guests" className="text-amber-200 underline">
                Voir les invités
              </Link>
            </AdminHint>
          </div>

          <div className="admin-field">
            <label htmlFor="theme">Thème de l’émission</label>
            <input
              id="theme"
              name="theme"
              required
              list="arena-show-domains"
              defaultValue={domain}
              placeholder="Ex. Musique, humour, cinéma"
            />
            <datalist id="arena-show-domains">
              {domains.map((item) => (
                <option key={item.id} value={item.name} />
              ))}
              {guests
                .map((guest) => guest.profession)
                .filter(Boolean)
                .filter((value, index, all) => all.indexOf(value) === index)
                .map((value) => (
                  <option key={value} value={value} />
                ))}
            </datalist>
            <AdminHint>Le thème s’affiche sous le nom, sur la page Émissions.</AdminHint>
          </div>

          <div className="admin-card md:col-span-2 space-y-4 border-amber-400/25 bg-amber-400/5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
                Vidéo de l’émission
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#c5ccd8]">
                Déposez la vidéo : une barre de progression s’affiche, sans bloquer le formulaire.
                Ensuite ajoutez la miniature. Publier met l’émission en ligne tout de suite.
              </p>
            </div>
            <MediaField
              name="videoUrl"
              label="Vidéo de l’émission"
              defaultValue={show?.videoUrl || ""}
              kind="video"
              folder="media"
              dropzone
              required
              hint="Fichier MP4 / WebM jusqu’à 200 Mo, ou lien YouTube / Facebook / Instagram / TikTok. L’envoi ne bloque pas la page."
              persist={show?.id ? { target: "arenaShow", id: show.id, field: "videoUrl" } : undefined}
            />
            <MediaField
              name="videoThumbnail"
              label="Miniature"
              defaultValue={show?.videoThumbnail || ""}
              kind="image"
              folder="media"
              dropzone
              hint="Miniature de la vidéo, avant lecture. Pas d’affiche ni photo d’invité ici."
              persist={
                show?.id ? { target: "arenaShow", id: show.id, field: "videoThumbnail" } : undefined
              }
            />
          </div>
        </div>

        {!state.ok && state.message ? (
          <p className="text-sm text-red-300">{state.message}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-3">
          <SubmitButton>{show ? "Mettre à jour" : "Publier l’émission"}</SubmitButton>
          {show ? (
            <Link href="/admin/arena/emissions" className="admin-btn admin-btn-ghost">
              Toutes les émissions
            </Link>
          ) : null}
        </div>
      </form>
      {show?.id ? (
        <div className="admin-card flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#9aa3b5]">
            {show.status === "ARCHIVED"
              ? "Cette émission est déjà aux archives. Supprimer la retire définitivement du site public."
              : "Supprimer l’envoie aux archives. Le public la verra encore là-bas, jusqu’à un retrait définitif."}
          </p>
          {show.status === "ARCHIVED" ? (
            <AdminConfirmForm
              action={deleteArenaShow}
              label="Supprimer"
              title="Retirer définitivement des archives ?"
              description="Le public ne verra plus cet épisode dans les archives. Cette action est irréversible."
              confirmLabel="Oui, retirer"
            >
              <input type="hidden" name="id" value={show.id} />
              <input type="hidden" name="next" value="/admin/arena/archives" />
            </AdminConfirmForm>
          ) : (
            <AdminConfirmForm
              action={archiveArenaShow}
              label="Supprimer"
              title="Envoyer aux archives ?"
              description="L’émission quitte l’accueil et Arena. Elle reste visible dans Archives jusqu’à ce que vous la retiriez."
              confirmLabel="Oui, archiver"
            >
              <input type="hidden" name="id" value={show.id} />
              <input type="hidden" name="next" value="/admin/arena/archives" />
            </AdminConfirmForm>
          )}
        </div>
      ) : null}
    </div>
  );
}
