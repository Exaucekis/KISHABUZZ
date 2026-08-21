"use client";

import { useActionState, useState } from "react";
import { deleteMedia, saveMedia } from "@/actions/admin/media";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SaveResultFromState } from "@/components/admin/SaveResultDialog";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";
import { galleryCategoryLabel } from "@/lib/utils";

type Media = {
  id: string;
  title: string;
  description: string;
  kind: string;
  url: string;
  thumbnail: string;
  alt?: string;
  category: string;
  visible: boolean;
  date: Date | null;
};

const initial: AdminActionState = { ok: false, message: "" };

function toDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function MediaForm({ media }: { media?: Media }) {
  const [state, action] = useActionState(saveMedia, initial);
  const [kind, setKind] = useState(media?.kind || "IMAGE");

  return (
    <form action={action} className="admin-card">
      {media?.id ? <input type="hidden" name="id" value={media.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="admin-field sm:col-span-2">
          <label>Titre</label>
          <input name="title" required defaultValue={media?.title || ""} />
          <AdminHint>Nom du média, affiché sous la photo ou la vidéo.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Type</label>
          <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Vidéo</option>
          </select>
          <AdminHint>Image = photo. Vidéo = YouTube, Instagram, TikTok, Facebook ou fichier.</AdminHint>
        </div>
        <div className="admin-field">
          <label>Catégorie</label>
          <select name="category" defaultValue={media?.category || "ACTIVITES"}>
            {["ACTIVITES", "EMISSIONS", "EVENEMENTS", "REPORTAGES", "COULISSES", "ARENA_CULTURE"].map(
              (c) => (
                <option key={c} value={c}>
                  {galleryCategoryLabel(c)}
                </option>
              )
            )}
          </select>
          <AdminHint>
            Une vidéo Arena se publie dans Arena → Émissions (Nouvelle émission). Une photo d’invité ne
            s’affiche pas ici : ouvrez Arena → Galerie et ajoutez-la dans l’album.
          </AdminHint>
        </div>
        <MediaField
          name="url"
          label={kind === "VIDEO" ? "Vidéo" : "Image"}
          defaultValue={media?.url || ""}
          kind={kind === "VIDEO" ? "video" : "image"}
          folder="media"
          required
          altName={kind === "VIDEO" ? undefined : "alt"}
          defaultAlt={media?.alt || ""}
        />
        <MediaField
          name="thumbnail"
          label="Miniature"
          defaultValue={media?.thumbnail || ""}
          kind="image"
          folder="media"
          hint="Aperçu avant lecture. Utile pour les vidéos. Optionnel."
        />
        <div className="admin-field">
          <label>Date</label>
          <input name="date" type="date" defaultValue={toDate(media?.date || null)} />
          <AdminHint>Date du tournage ou de l’événement. Sert au tri.</AdminHint>
        </div>
        <div className="admin-field sm:col-span-2">
          <label>Description</label>
          <textarea name="description" defaultValue={media?.description || ""} />
          <AdminHint>Légende courte, visible sous le média.</AdminHint>
        </div>
        <div className="admin-field">
          <label className="admin-check">
            <input type="checkbox" name="visible" defaultChecked={media?.visible ?? true} />
            Visible
          </label>
          <AdminHint>Décochez pour garder le fichier sans l’afficher au public.</AdminHint>
        </div>
      </div>
      {state.message && !state.ok ? (
        <p className="mb-2 text-sm text-red-300">{state.message}</p>
      ) : null}
      <SaveResultFromState state={state} titleOk="Média enregistré" />
      <SubmitButton>{media ? "Mettre à jour" : "Ajouter"}</SubmitButton>
    </form>
  );
}

export function MediaManager({ items }: { items: Media[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Ajouter un média
        </h2>
        <MediaForm />
      </div>
      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.id}>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <p className="text-sm text-[#9aa3b5]">
                {m.kind} · {galleryCategoryLabel(m.category)} · {m.visible ? "Visible" : "Masqué"}
              </p>
              <form action={deleteMedia}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <MediaForm media={m} />
          </div>
        ))}
        {!items.length ? <p className="text-sm text-[#9aa3b5]">Aucun média.</p> : null}
      </div>
    </div>
  );
}
