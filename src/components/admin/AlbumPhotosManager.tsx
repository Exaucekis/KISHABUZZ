"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  addPhotoToAlbum,
  removePhotoFromAlbum,
  setAlbumCover,
} from "@/actions/admin/albums";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Photo = {
  id: string;
  title: string;
  url: string;
  description: string;
  alt?: string;
};

type Album = {
  id: string;
  slug: string;
  guestName: string;
  coverImage: string;
  photos: Photo[];
};

const initial: AdminActionState = { ok: false, message: "" };

export function AlbumPhotosManager({ album }: { album: Album }) {
  const [state, action] = useActionState(addPhotoToAlbum, initial);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#9aa3b5]">Album invité — ajoutez les photos une par une</p>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
            {album.guestName}
          </h1>
        </div>
        <Link href="/admin/arena/albums" className="admin-btn admin-btn-ghost">
          ← Tous les albums
        </Link>
      </div>

      <form action={action} className="admin-card">
        <input type="hidden" name="albumId" value={album.id} />
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Ajouter une photo
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="admin-field sm:col-span-2">
            <label>Titre</label>
            <input name="title" required placeholder="Ex. Plateau avec Maman Sharonne" />
            <AdminHint>Légende courte de la photo.</AdminHint>
          </div>
          <MediaField
            name="url"
            label="Photo"
            kind="image"
            folder="albums"
            required
            hint="Fichier ou lien. S’ajoute à l’album de cet invité."
            altName="alt"
          />
          <div className="admin-field sm:col-span-2">
            <label>Description (optionnel)</label>
            <input name="description" />
            <AdminHint>Détail optionnel (lieu, moment, personnes).</AdminHint>
          </div>
        </div>
        {state.message ? (
          <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
            {state.message}
          </p>
        ) : null}
        <SubmitButton>Ajouter la photo</SubmitButton>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {album.photos.map((p) => (
          <div key={p.id} className="admin-card overflow-hidden p-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.alt || p.title} className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-2 p-3">
              <p className="font-medium">{p.title}</p>
              <div className="flex flex-wrap gap-2">
                <form action={setAlbumCover}>
                  <input type="hidden" name="albumId" value={album.id} />
                  <input type="hidden" name="url" value={p.url} />
                  <input type="hidden" name="albumSlug" value={album.slug} />
                  <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                    {album.coverImage === p.url ? "Couverture ✓" : "Définir couverture"}
                  </button>
                </form>
                <form action={removePhotoFromAlbum}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="albumSlug" value={album.slug} />
                  <button type="submit" className="admin-btn admin-btn-danger text-xs">
                    Suppr.
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {!album.photos.length ? (
          <p className="text-sm text-[#9aa3b5] sm:col-span-2">Aucune photo dans cet album.</p>
        ) : null}
      </div>
    </div>
  );
}
