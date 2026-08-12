"use client";

import { useActionState } from "react";
import { deleteMedia, saveMedia } from "@/actions/admin/media";
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
  return (
    <form action={action} className="admin-card">
      {media?.id ? <input type="hidden" name="id" value={media.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="admin-field sm:col-span-2">
          <label>Titre</label>
          <input name="title" required defaultValue={media?.title || ""} />
        </div>
        <div className="admin-field">
          <label>Type</label>
          <select name="kind" defaultValue={media?.kind || "IMAGE"}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Vidéo</option>
          </select>
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
        </div>
        <div className="admin-field sm:col-span-2">
          <label>URL</label>
          <input name="url" required defaultValue={media?.url || ""} />
        </div>
        <div className="admin-field">
          <label>Miniature (URL)</label>
          <input name="thumbnail" defaultValue={media?.thumbnail || ""} />
        </div>
        <div className="admin-field">
          <label>Date</label>
          <input name="date" type="date" defaultValue={toDate(media?.date || null)} />
        </div>
        <div className="admin-field sm:col-span-2">
          <label>Description</label>
          <textarea name="description" defaultValue={media?.description || ""} />
        </div>
        <label className="admin-check admin-field">
          <input type="checkbox" name="visible" defaultChecked={media?.visible ?? true} />
          Visible
        </label>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
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
