"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deletePhotoAlbum, savePhotoAlbum } from "@/actions/admin/albums";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Album = {
  id: string;
  guestName: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  emissionLabel: string;
  date: Date | null;
  visible: boolean;
  order: number;
  _count?: { photos: number };
};

const initial: AdminActionState = { ok: false, message: "" };

function toDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function AlbumForm({ album }: { album?: Album }) {
  const [state, action] = useActionState(savePhotoAlbum, initial);
  return (
    <form action={action} className="admin-card">
      {album?.id ? <input type="hidden" name="id" value={album.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="admin-field sm:col-span-2">
          <label>Nom de l&apos;invité (titre de l&apos;album)</label>
          <input name="guestName" required defaultValue={album?.guestName || ""} />
        </div>
        <div className="admin-field sm:col-span-2">
          <label>Titre affiché (optionnel)</label>
          <input name="title" defaultValue={album?.title || ""} placeholder="Ex. Maman Sharonne · Arena Grand Culture" />
        </div>
        <div className="admin-field">
          <label>Émission</label>
          <input name="emissionLabel" defaultValue={album?.emissionLabel || "Arena Grand Culture"} />
        </div>
        <div className="admin-field">
          <label>Date</label>
          <input name="date" type="date" defaultValue={toDate(album?.date || null)} />
        </div>
        <div className="admin-field sm:col-span-2">
          <label>Image de couverture (URL)</label>
          <input name="coverImage" defaultValue={album?.coverImage || ""} />
        </div>
        <div className="admin-field sm:col-span-2">
          <label>Description</label>
          <textarea name="description" defaultValue={album?.description || ""} />
        </div>
        <div className="admin-field">
          <label>Ordre</label>
          <input name="order" type="number" defaultValue={album?.order ?? 0} />
        </div>
        <label className="admin-check admin-field">
          <input type="checkbox" name="visible" defaultChecked={album?.visible ?? true} />
          Visible sur le site
        </label>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{album ? "Mettre à jour" : "Créer l'album"}</SubmitButton>
    </form>
  );
}

export function AlbumsManager({ albums }: { albums: Album[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouvel album (invité)
        </h2>
        <AlbumForm />
      </div>
      <div className="space-y-4">
        {albums.map((a) => (
          <div key={a.id} className="admin-card">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                {a.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.coverImage}
                    alt=""
                    className="h-16 w-14 rounded object-cover"
                  />
                ) : null}
                <div>
                  <p className="font-semibold">{a.guestName}</p>
                  <p className="text-sm text-[#9aa3b5]">
                    {a.emissionLabel} · {a._count?.photos ?? 0} photo(s) ·{" "}
                    {a.visible ? "Visible" : "Masqué"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/arena/albums/${a.slug}`} className="admin-btn admin-btn-ghost text-xs">
                  Photos
                </Link>
                <form action={deletePhotoAlbum}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="admin-btn admin-btn-danger text-xs">
                    Suppr.
                  </button>
                </form>
              </div>
            </div>
            <AlbumForm album={a} />
          </div>
        ))}
        {!albums.length ? (
          <p className="text-sm text-[#9aa3b5]">Aucun album. Créez le premier (ex. Maman Sharonne).</p>
        ) : null}
      </div>
    </div>
  );
}
