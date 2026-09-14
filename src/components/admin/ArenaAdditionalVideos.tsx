"use client";

import { useActionState } from "react";
import { deleteMedia, saveMedia } from "@/actions/admin/media";
import { AdminConfirmForm } from "@/components/admin/AdminConfirmForm";
import { AdminHint } from "@/components/admin/AdminHint";
import { MediaField } from "@/components/admin/MediaField";
import { SaveResultFromState } from "@/components/admin/SaveResultDialog";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Video = { id: string; title: string; url: string; thumbnail: string; description: string };
const initial: AdminActionState = { ok: false, message: "" };

export function ArenaAdditionalVideos({ showId, videos }: { showId: string; videos: Video[] }) {
  const [state, action] = useActionState(saveMedia, initial);

  return (
    <section className="admin-card space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Playlist de l’émission</p>
        <p className="mt-2 text-sm text-[#9aa3b5]">Ajoutez les extraits, bonus ou parties suivantes. Ils sont enregistrés avec cette émission et apparaissent dans la playlist publique.</p>
      </div>

      <form action={action} className="grid gap-3 md:grid-cols-2">
        <input type="hidden" name="arenaShowId" value={showId} />
        <input type="hidden" name="kind" value="VIDEO" />
        <input type="hidden" name="category" value="ARENA_CULTURE" />
        <div className="admin-field md:col-span-2">
          <label htmlFor={`extra-video-title-${showId}`}>Titre de la vidéo</label>
          <input id={`extra-video-title-${showId}`} name="title" required placeholder="Ex. Partie 2 · Questions du public" />
        </div>
        <MediaField name="url" label="Vidéo" kind="video" folder="media" required />
        <MediaField name="thumbnail" label="Miniature" kind="image" folder="media" hint="Optionnelle, mais recommandée pour la playlist." />
        <div className="admin-field md:col-span-2">
          <label htmlFor={`extra-video-description-${showId}`}>Description courte</label>
          <textarea id={`extra-video-description-${showId}`} name="description" rows={2} placeholder="Ce que contient cette vidéo…" />
        </div>
        <label className="admin-check md:col-span-2">
          <input type="checkbox" name="visible" defaultChecked /> Visible dans la playlist
        </label>
        <div className="md:col-span-2">
          <SubmitButton>Ajouter à la playlist</SubmitButton>
          <SaveResultFromState state={state} titleOk="Vidéo ajoutée à la playlist" resetForm />
        </div>
      </form>

      <div className="border-t border-white/10 pt-4">
        <h3 className="font-semibold">Vidéos enregistrées · {videos.length}</h3>
        {videos.length ? (
          <ul className="mt-3 space-y-2">
            {videos.map((video) => (
              <li key={video.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
                <div>
                  <p className="font-medium">{video.title}</p>
                  {video.description ? <p className="mt-1 text-sm text-[#9aa3b5]">{video.description}</p> : null}
                </div>
                <AdminConfirmForm action={deleteMedia} label="Retirer" title="Retirer cette vidéo de la playlist ?" description="La vidéo ne sera plus disponible dans cette émission." confirmLabel="Oui, retirer">
                  <input type="hidden" name="id" value={video.id} />
                </AdminConfirmForm>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-[#9aa3b5]">Aucune vidéo supplémentaire pour le moment.</p>}
      </div>
    </section>
  );
}
