"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { saveEvent } from "@/actions/admin/events";
import { MediaField } from "@/components/admin/MediaField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";
import { eventCapacityError, sumTicketQuantities } from "@/lib/event-capacity";

type Category = { id: string; name: string };
type Organizer = { id: string; name: string; email: string; role: string };
type GalleryItem = { id?: string; url: string };
type TicketType = {
  id?: string;
  name: string;
  description: string;
  benefits: string;
  price: number;
  quantity: number;
  maxPerOrder: number;
  visible: boolean;
  soldCount?: number;
  reservedCount?: number;
};
type EventValue = {
  id: string;
  title: string;
  summary: string;
  description: string;
  poster: string;
  startsAt: Date;
  endsAt: Date | null;
  venueName: string;
  address: string;
  city: string;
  categoryId: string | null;
  organizerId: string | null;
  capacity: number;
  status: string;
  currency: string;
  salesOpensAt: Date | null;
  salesClosesAt: Date | null;
  featured: boolean;
  ticketTypes: TicketType[];
  gallery: GalleryItem[];
};

function toInputDate(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
}

const initial: AdminActionState = { ok: false, message: "" };

const emptyType = (): TicketType => ({
  name: "",
  description: "",
  benefits: "",
  price: 0,
  quantity: 0,
  maxPerOrder: 6,
  visible: true,
  soldCount: 0,
  reservedCount: 0,
});

export function EventForm({
  event,
  categories,
  organizers = [],
  currentUserId,
  notice,
}: {
  event?: EventValue;
  categories: Category[];
  organizers?: Organizer[];
  currentUserId?: string;
  notice?: string;
}) {
  const [state, action] = useActionState(saveEvent, initial);
  const [types, setTypes] = useState<TicketType[]>(
    event?.ticketTypes.length ? event.ticketTypes : [emptyType()]
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(event?.gallery || []);
  const [capacity, setCapacity] = useState(event?.capacity ?? 0);
  const [status, setStatus] = useState(event?.status || "DRAFT");
  const payload = useMemo(() => JSON.stringify(types), [types]);
  const galleryPayload = useMemo(
    () => JSON.stringify(gallery.filter((item) => item.url.trim())),
    [gallery]
  );
  const ticketSum = sumTicketQuantities(types.map((type) => type.quantity));
  const takenSeats = types.reduce(
    (sum, type) => sum + (type.soldCount || 0) + (type.reservedCount || 0),
    0
  );
  const liveError = eventCapacityError({
    capacity,
    status,
    quantities: types.map((type) => type.quantity),
    takenSeats,
  });

  function updateType(index: number, patch: Partial<TicketType>) {
    setTypes((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <form action={action} className="admin-card space-y-1">
      {event?.id ? <input type="hidden" name="id" value={event.id} /> : null}
      <input type="hidden" name="ticketTypes" value={payload} />
      <input type="hidden" name="gallery" value={galleryPayload} />
      <input type="hidden" name="currency" value="CDF" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="admin-field md:col-span-2">
          <label htmlFor="title">Nom de l’événement</label>
          <input id="title" name="title" required defaultValue={event?.title || ""} />
          <AdminHint>Titre public, affiché sur la carte et la fiche.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="categoryId">Catégorie</label>
          <select id="categoryId" name="categoryId" defaultValue={event?.categoryId || ""}>
            <option value="">— Aucune —</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <AdminHint>
            Créez les catégories dans{" "}
            <Link href="/admin/evenements/categories" className="underline">
              Catégories événements
            </Link>
            .
          </AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="organizerId">Organisateur</label>
          <select
            id="organizerId"
            name="organizerId"
            defaultValue={event?.organizerId || currentUserId || ""}
          >
            {organizers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} · {user.email}
              </option>
            ))}
          </select>
          <AdminHint>Compte qui voit le dashboard ventes et peut nommer le staff.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="status">Statut</label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="SOLD_OUT">Complet</option>
            <option value="ENDED">Terminé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
          <AdminHint>Publiez seulement si la capacité et les tarifs sont cohérents.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="startsAt">Début</label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toInputDate(event?.startsAt)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="endsAt">Fin</label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toInputDate(event?.endsAt)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="venueName">Lieu</label>
          <input id="venueName" name="venueName" defaultValue={event?.venueName || ""} />
        </div>
        <div className="admin-field">
          <label htmlFor="city">Ville</label>
          <input id="city" name="city" defaultValue={event?.city || ""} />
        </div>
        <div className="admin-field md:col-span-2">
          <label htmlFor="address">Adresse</label>
          <input id="address" name="address" defaultValue={event?.address || ""} />
        </div>
        <MediaField
          name="poster"
          label="Affiche"
          defaultValue={event?.poster || ""}
          kind="image"
          folder="media"
          className="admin-field md:col-span-2"
          hint="Visuel principal de la carte événement. Haute qualité, format 16:10 recommandé."
        />
        <div className="admin-field md:col-span-2">
          <label htmlFor="summary">Accroche</label>
          <input id="summary" name="summary" defaultValue={event?.summary || ""} />
          <AdminHint>Une phrase pour les cartes et le SEO.</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={6} defaultValue={event?.description || ""} />
        </div>
        <div className="admin-field">
          <label htmlFor="capacity">Capacité globale</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={takenSeats}
            value={capacity}
            onChange={(e) => setCapacity(Number.parseInt(e.target.value, 10) || 0)}
          />
          <AdminHint>
            Jauge de la salle. Obligatoire pour publier. Somme des tarifs : {ticketSum} place
            {ticketSum > 1 ? "s" : ""}.
          </AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="currencyDisplay">Devise</label>
          <input id="currencyDisplay" value="CDF" readOnly />
          <AdminHint>CinetPay V1 : francs congolais uniquement, montants multiples de 5.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="salesOpensAt">Ouverture des ventes</label>
          <input
            id="salesOpensAt"
            name="salesOpensAt"
            type="datetime-local"
            defaultValue={toInputDate(event?.salesOpensAt)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="salesClosesAt">Fermeture des ventes</label>
          <input
            id="salesClosesAt"
            name="salesClosesAt"
            type="datetime-local"
            defaultValue={toInputDate(event?.salesClosesAt)}
          />
        </div>
        <div className="admin-field md:col-span-2">
          <label className="admin-check">
            <input type="checkbox" name="featured" defaultChecked={event?.featured || false} />
            Mettre en avant
          </label>
        </div>
      </div>

      {liveError ? <p className="mt-4 text-sm text-red-300">{liveError}</p> : null}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">Galerie</h2>
          <button
            type="button"
            className="admin-btn admin-btn-ghost text-xs"
            onClick={() => setGallery((rows) => [...rows, { url: "" }])}
          >
            Ajouter une photo
          </button>
        </div>
        <AdminHint>Photos supplémentaires de la fiche publique, hors affiche.</AdminHint>
        <div className="mt-3 space-y-3">
          {gallery.map((item, index) => (
            <div key={item.id || `gallery-${index}`} className="rounded-md border border-white/10 p-3">
              <MediaField
                name={`galleryFile_${index}`}
                label={`Photo ${index + 1}`}
                defaultValue={item.url}
                kind="image"
                folder="events"
                className="admin-field"
                hint="Fichier, lien, ou Bibliothèque."
                onUrlChange={(url) =>
                  setGallery((rows) => rows.map((row, i) => (i === index ? { ...row, url } : row)))
                }
              />
              <button
                type="button"
                className="admin-btn admin-btn-danger mt-2 text-xs"
                onClick={() => setGallery((rows) => rows.filter((_, i) => i !== index))}
              >
                Retirer
              </button>
            </div>
          ))}
          {!gallery.length ? (
            <p className="text-sm text-[#9aa3b5]">Aucune photo de galerie pour le moment.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
            Catégories de billets
          </h2>
          <button
            type="button"
            className="admin-btn admin-btn-ghost text-xs"
            onClick={() => setTypes((rows) => [...rows, emptyType()])}
          >
            Ajouter un tarif
          </button>
        </div>
        <AdminHint>
          Prix en francs, multiple de 5 (CinetPay). Le stock déjà vendu ou réservé ne peut pas être
          diminué.
        </AdminHint>
        <div className="mt-3 space-y-3">
          {types.map((type, index) => {
            const taken = (type.soldCount || 0) + (type.reservedCount || 0);
            return (
              <div key={type.id || `new-${index}`} className="rounded-md border border-white/10 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="admin-field">
                    <label>Nom du billet</label>
                    <input
                      value={type.name}
                      onChange={(e) => updateType(index, { name: e.target.value })}
                      placeholder="Standard, VIP, Early Bird…"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Prix</label>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={type.price}
                      onChange={(e) => updateType(index, { price: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Quantité</label>
                    <input
                      type="number"
                      min={taken}
                      value={type.quantity}
                      onChange={(e) => updateType(index, { quantity: Number(e.target.value) || 0 })}
                    />
                    {taken ? (
                      <AdminHint>
                        {type.soldCount || 0} vendu{(type.soldCount || 0) > 1 ? "s" : ""} ·{" "}
                        {type.reservedCount || 0} réservé{(type.reservedCount || 0) > 1 ? "s" : ""}
                      </AdminHint>
                    ) : null}
                  </div>
                  <div className="admin-field">
                    <label>Max par commande</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={type.maxPerOrder}
                      onChange={(e) => updateType(index, { maxPerOrder: Number(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="admin-field md:col-span-2">
                    <label>Description / avantages</label>
                    <textarea
                      value={type.benefits || type.description}
                      onChange={(e) =>
                        updateType(index, { benefits: e.target.value, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                  <div className="admin-field md:col-span-2 flex flex-wrap items-center justify-between gap-2">
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={type.visible}
                        onChange={(e) => updateType(index, { visible: e.target.checked })}
                      />
                      Visible à la vente
                    </label>
                    {types.length > 1 && taken === 0 ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger text-xs"
                        onClick={() => setTypes((rows) => rows.filter((_, i) => i !== index))}
                      >
                        Retirer
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {notice && !state.message ? (
        <p className="mt-4 text-sm text-red-300">{notice}</p>
      ) : null}
      {state.message ? (
        <p className={`mt-4 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <div className="mt-4">
        <SubmitButton>{event ? "Enregistrer" : "Créer l’événement"}</SubmitButton>
      </div>
    </form>
  );
}
