"use client";

import { useActionState } from "react";
import { publishGuestPhoto } from "@/actions/admin/albums";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SaveResultFromState } from "@/components/admin/SaveResultDialog";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

const initial: AdminActionState = { ok: false, message: "" };

export function QuickPhotoForm({ guests }: { guests: string[] }) {
  const [state, action] = useActionState(publishGuestPhoto, initial);
  const names = [...new Set(guests.map((name) => name.trim()).filter(Boolean))];

  return (
    <form action={action} className="admin-card">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
        Publier une photo
      </h2>
      <p className="admin-page-hint mb-4">Invité + fichier. L’album se crée tout seul si besoin.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="admin-field sm:col-span-2">
          <label>Invité</label>
          <input name="guestName" list="quick-photo-guests" required placeholder="Nom de l’invité" />
          <datalist id="quick-photo-guests">
            {names.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <AdminHint>Choisissez un nom déjà vu, ou tapez un nouvel invité.</AdminHint>
        </div>
        <MediaField
          name="url"
          label="Photo"
          kind="image"
          folder="albums"
          required
          dropzone
          hint="Déposez le fichier. Il apparaît tout de suite sur Arena → Galerie et sur l’accueil."
          altName="alt"
        />
      </div>
      {state.message && !state.ok ? (
        <p className="mb-2 text-sm text-red-300">{state.message}</p>
      ) : null}
      <SaveResultFromState state={state} titleOk="Photo en ligne" resetForm />
      <SubmitButton>Publier</SubmitButton>
    </form>
  );
}
