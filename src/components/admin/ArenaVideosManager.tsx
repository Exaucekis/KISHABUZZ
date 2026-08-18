"use client";

import { useActionState } from "react";
import { deleteMedia, saveMedia } from "@/actions/admin/media";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";
import { videoPoster } from "@/lib/media";

type ShowOption = { id: string; title: string; number: number };
type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  visible: boolean;
  featured: boolean;
  date: Date | null;
  arenaShowId: string | null;
};

const initial: AdminActionState = { ok: false, message: "" };

function toDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function VideoForm({ video, shows }: { video?: Video; shows: ShowOption[] }) {
  const [state, action] = useActionState(saveMedia, initial);

  return (
    <form action={action} className="admin-card">
      {video?.id ? <input type="hidden" name="id" value={video.id} /> : null}
      <input type="hidden" name="kind" value="VIDEO" />
      <input type="hidden" name="category" value="ARENA_CULTURE" />
      <input type="hidden" name="hasFeatured" value="1" />

      <div className="admin-field">
        <label>Titre</label>
        <input name="title" required defaultValue={video?.title || ""} />
        <AdminHint>Nom affiché sur la page Vidéos Arena.</AdminHint>
      </div>

      <MediaField
        name="url"
        label="Vidéo"
        defaultValue={video?.url || ""}
        kind="video"
        folder="media"
        required
        hint="Lien YouTube / Instagram / TikTok / Facebook, ou fichier MP4."
      />

      <MediaField
        name="thumbnail"
        label="Miniature"
        defaultValue={video?.thumbnail || ""}
        kind="image"
        folder="media"
        hint="Image affichée avant lecture. Si vide, YouTube fournit une miniature automatique."
      />

      <div className="admin-field">
        <label>Émission liée</label>
        <select name="arenaShowId" defaultValue={video?.arenaShowId || ""}>
          <option value="">— Aucune —</option>
          {shows.map((show) => (
            <option key={show.id} value={show.id}>
              #{show.number} · {show.title}
            </option>
          ))}
        </select>
        <AdminHint>Optionnel. La vidéo apparaît aussi sur la fiche de l’émission.</AdminHint>
      </div>

      <div className="admin-field">
        <label>Date</label>
        <input name="date" type="date" defaultValue={toDate(video?.date || null)} />
      </div>

      <div className="admin-field">
        <label>Description</label>
        <textarea name="description" defaultValue={video?.description || ""} />
      </div>

      <div className="admin-field">
        <label className="admin-check">
          <input type="checkbox" name="visible" defaultChecked={video?.visible ?? true} />
          Publiée
        </label>
      </div>

      <div className="admin-field">
        <label className="admin-check">
          <input type="checkbox" name="featured" defaultChecked={video?.featured || false} />
          Vidéo à la une
        </label>
        <AdminHint>Une seule vidéo à la une : elle ouvre la page Vidéos Arena.</AdminHint>
      </div>

      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{video ? "Mettre à jour" : "Publier la vidéo"}</SubmitButton>
    </form>
  );
}

export function ArenaVideosManager({
  videos,
  shows,
}: {
  videos: Video[];
  shows: ShowOption[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouvelle vidéo
        </h2>
        <VideoForm shows={shows} />
      </div>
      <div className="space-y-3">
        {videos.map((video) => {
          const poster = videoPoster(video.url, video.thumbnail);
          return (
            <div key={video.id} className="admin-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{video.title}</p>
                  <p className="text-xs text-[#9aa3b5]">
                    {video.featured ? "À la une · " : ""}
                    {video.visible ? "Publiée" : "Masquée"}
                    {poster ? "" : " · sans miniature"}
                  </p>
                </div>
                <form action={deleteMedia}>
                  <input type="hidden" name="id" value={video.id} />
                  <button type="submit" className="admin-btn admin-btn-danger text-xs">
                    Suppr.
                  </button>
                </form>
              </div>
              {poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster}
                  alt=""
                  className="mb-3 h-32 w-full rounded-md object-cover"
                />
              ) : null}
              <VideoForm video={video} shows={shows} />
            </div>
          );
        })}
        {!videos.length ? <p className="text-sm text-[#9aa3b5]">Aucune vidéo Arena pour l’instant.</p> : null}
      </div>
    </div>
  );
}
