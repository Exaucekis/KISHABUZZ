"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { archiveArenaShow, announceNextGuest } from "@/actions/admin/arena";
import { AdminConfirmForm } from "@/components/admin/AdminConfirmForm";
import { AdminHint } from "@/components/admin/AdminHint";
import { MediaField } from "@/components/admin/MediaField";
import { SaveResultFromState } from "@/components/admin/SaveResultDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type GuestOption = { id: string; name: string; photo: string; profession: string };
type CurrentShow = {
  id: string;
  title: string;
  poster: string;
  theme: string;
  airDate: string;
  airTime: string;
  status: string;
  guestId: string | null;
  guestName: string | null;
};

const initial: AdminActionState = { ok: false, message: "" };

function toDateInput(value: string) {
  return value ? value.slice(0, 10) : "";
}

export function NextGuestAnnounceForm({
  guests,
  current,
}: {
  guests: GuestOption[];
  current: CurrentShow | null;
}) {
  const router = useRouter();
  const [state, action] = useActionState(announceNextGuest, initial);

  const selectedGuestId = current?.guestId || guests[0]?.id || "";

  return (
    <div className="space-y-6">
      {current ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
          {current.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.poster} alt="" className="h-20 w-14 rounded object-cover" />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-amber-200">En ligne maintenant</p>
            <p className="font-medium">{current.guestName || current.title}</p>
            <p className="text-sm text-[#9aa3b5]">
              Visible sur l’accueil et Arena sous « Prochain invité ».
            </p>
          </div>
          <StatusBadge status={current.status} />
          <a
            href="/"
            className="admin-btn admin-btn-ghost text-xs"
            target="_blank"
            rel="noreferrer"
          >
            Voir l’accueil
          </a>
          <Link href="#annonce" className="admin-btn admin-btn-primary text-xs">
            Modifier
          </Link>
          <AdminConfirmForm
            action={archiveArenaShow}
            label="Supprimer"
            title="Envoyer cette affiche aux archives ?"
            description="Le prochain invité quitte l’accueil. L’affiche reste dans Archives jusqu’à ce que vous la retiriez définitivement."
            confirmLabel="Oui, archiver"
          >
            <input type="hidden" name="id" value={current.id} />
            <input type="hidden" name="next" value="/admin/arena/archives" />
          </AdminConfirmForm>
        </div>
      ) : guests.length ? (
        <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-[#9aa3b5]">
          Personne n’est encore sur l’accueil. Choisissez une fiche ci-dessous, ajoutez l’affiche
          d’émission, puis cliquez Annoncer.
        </p>
      ) : (
        <div className="admin-card space-y-3">
          <p className="font-medium">Rien à annoncer pour l’instant</p>
          <p className="text-sm text-[#9aa3b5]">
            Cette page ne crée pas la personne. Elle affiche seulement l’affiche du prochain invité
            sur l’accueil. Il n’y a encore aucune fiche : créez-en une, puis revenez ici.
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-[#eef1f6]">
            <li>Ouvrez Fiches invités et créez le nom + le portrait.</li>
            <li>Revenez ici, choisissez cet invité, déposez l’affiche d’émission.</li>
            <li>Cliquez Annoncer : ça apparaît tout de suite sur l’accueil.</li>
          </ol>
          <Link href="/admin/arena/guests" className="admin-btn admin-btn-primary">
            Créer la première fiche
          </Link>
        </div>
      )}

      {guests.length ? (
      <form id="annonce" action={action} className="admin-card space-y-4">
        {current?.id ? <input type="hidden" name="id" value={current.id} /> : null}
        <div className="admin-field">
          <label htmlFor="guestId">Invité à annoncer</label>
          <select id="guestId" name="guestId" required defaultValue={selectedGuestId}>
            <option value="">— Choisir —</option>
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name}
                {guest.profession ? ` · ${guest.profession}` : ""}
              </option>
            ))}
          </select>
          <AdminHint>
            La liste vient des fiches. Si le nom n’y est pas, créez d’abord la fiche (bouton
            ci-dessous).
          </AdminHint>
        </div>
        <MediaField
          name="poster"
          label="Affiche"
          defaultValue={current?.poster || ""}
          kind="image"
          folder="covers"
          hint="Image de l’émission (pas le portrait). C’est ça qui s’affiche en grand sur l’accueil."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="admin-field">
            <label htmlFor="theme">Thème</label>
            <input id="theme" name="theme" defaultValue={current?.theme || ""} />
            <AdminHint>Optionnel. Ex. Musique urbaine.</AdminHint>
          </div>
          <div className="admin-field">
            <label htmlFor="airDate">Date</label>
            <input
              id="airDate"
              name="airDate"
              type="date"
              defaultValue={toDateInput(current?.airDate || "")}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="airTime">Heure</label>
            <input
              id="airTime"
              name="airTime"
              defaultValue={current?.airTime || ""}
              placeholder="20:00"
            />
          </div>
        </div>
        {state.message && !state.ok ? (
          <p className="text-sm text-red-300">{state.message}</p>
        ) : null}
        <SaveResultFromState
          state={state}
          titleOk="Prochain invité en ligne"
          titleErr="Annonce impossible"
          onOk={() => router.refresh()}
        />
        <div className="flex flex-wrap gap-2">
          {current ? (
            <SubmitButton name="mode" value="update">
              Mettre à jour l’annonce
            </SubmitButton>
          ) : null}
          <SubmitButton name="mode" value="replace" pendingLabel="Annonce…">
            {current ? "Annoncer un nouvel invité" : "Annoncer sur le site"}
          </SubmitButton>
          <Link href="/admin/arena/guests" className="admin-btn admin-btn-ghost">
            La fiche n’existe pas ? Créer
          </Link>
        </div>
        <p className="admin-action-hint">
          « Annoncer un nouvel invité » envoie l’affiche actuelle aux archives. La vidéo d’émission
          reste en première ; la nouvelle affiche s’affiche juste en dessous.
        </p>
      </form>
      ) : null}
    </div>
  );
}
