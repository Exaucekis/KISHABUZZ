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
import { normalizeEventCurrency } from "@/lib/events";

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
  sessionKeys: string[];
};
type SessionDraft = {
  key: string;
  id?: string;
  startsAt: string;
  endsAt: string;
  access: "PAID" | "FREE";
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
  sessions?: { id: string; startsAt: Date; endsAt: Date | null; access: string }[];
};

function toInputDate(d: Date | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function sessionDate(value: string) {
  return value.slice(0, 10);
}

function sessionTime(value: string) {
  return value.length >= 16 ? value.slice(11, 16) : "";
}

function joinDateTime(date: string, time: string) {
  if (!date) return "";
  return `${date}T${time || "18:00"}`;
}

function weekdayLabel(date: string) {
  if (!date) return "";
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  const label = parsed.toLocaleDateString("fr-FR", { weekday: "long" });
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
}

function patchSession(
  rows: SessionDraft[],
  index: number,
  patch: { date?: string; time?: string; access?: SessionDraft["access"] }
) {
  return rows.map((row, i) => {
    if (i !== index) return row;
    const date = patch.date ?? sessionDate(row.startsAt);
    const time = patch.time ?? sessionTime(row.startsAt);
    const startsAt = joinDateTime(date, time);
    return {
      ...row,
      startsAt,
      endsAt: date ? `${date}T23:59` : "",
      access: patch.access ?? row.access,
    };
  });
}

const initial: AdminActionState = { ok: false, message: "" };

function newSessionKey() {
  return `tmp-${Math.random().toString(36).slice(2, 10)}`;
}

function emptySession(): SessionDraft {
  return { key: newSessionKey(), startsAt: "", endsAt: "", access: "PAID" };
}

function sessionsFromEvent(event?: EventValue): SessionDraft[] {
  if (event?.sessions?.length) {
    return event.sessions.map((session) => ({
      key: session.id,
      id: session.id,
      startsAt: toInputDate(session.startsAt),
      endsAt: toInputDate(session.endsAt),
      access: session.access === "FREE" ? "FREE" : "PAID",
    }));
  }
  if (event?.startsAt) {
    return [
      {
        key: newSessionKey(),
        startsAt: toInputDate(event.startsAt),
        endsAt: toInputDate(event.endsAt),
        access: "PAID",
      },
    ];
  }
  return [emptySession()];
}

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
  sessionKeys: [],
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
  const [sessions, setSessions] = useState<SessionDraft[]>(() => sessionsFromEvent(event));
  const [gallery, setGallery] = useState<GalleryItem[]>(event?.gallery || []);
  const [capacity, setCapacity] = useState(event?.capacity ?? 0);
  const [status, setStatus] = useState(event?.status || "DRAFT");
  const [currency, setCurrency] = useState(normalizeEventCurrency(event?.currency));
  const hasSales = Boolean(
    event?.ticketTypes.some((type) => (type.soldCount || 0) > 0 || (type.reservedCount || 0) > 0)
  );
  const payload = useMemo(() => JSON.stringify(types), [types]);
  const sessionsPayload = useMemo(
    () =>
      JSON.stringify(
        sessions.map((session) => {
          const date = sessionDate(session.startsAt);
          return {
            ...session,
            endsAt: date ? `${date}T23:59` : "",
          };
        })
      ),
    [sessions]
  );
  const galleryPayload = useMemo(
    () => JSON.stringify(gallery.filter((item) => item.url.trim())),
    [gallery]
  );
  const paidDays = sessions.filter((session) => session.access === "PAID");
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
      <input type="hidden" name="sessions" value={sessionsPayload} />
      <input type="hidden" name="gallery" value={galleryPayload} />
      {hasSales ? <input type="hidden" name="currency" value={currency} /> : null}

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
        <div className="admin-field md:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label>Journées</label>
            <button
              type="button"
              className="admin-btn admin-btn-ghost text-xs"
              onClick={() => setSessions((rows) => [...rows, emptySession()])}
            >
              Ajouter une journée
            </button>
          </div>
          <AdminHint>
            Une ligne = un jour de l’événement. Date + heure suffisent. Le jour (lundi, samedi…)
            s’affiche tout seul. Cochez Gratuit si on ne vend pas de billet ce jour-là.
          </AdminHint>
          <div className="mt-3 space-y-3">
            {sessions.map((session, index) => (
              <div key={session.key} className="rounded-md border border-white/10 p-3">
                <div className="grid gap-3 md:grid-cols-[1.2fr_0.9fr_0.8fr]">
                  <div className="admin-field">
                    <label htmlFor={`session-date-${session.key}`}>Date</label>
                    <input
                      id={`session-date-${session.key}`}
                      type="date"
                      required
                      value={sessionDate(session.startsAt)}
                      onChange={(e) =>
                        setSessions((rows) => patchSession(rows, index, { date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor={`session-day-${session.key}`}>Jour</label>
                    <input
                      id={`session-day-${session.key}`}
                      readOnly
                      value={weekdayLabel(sessionDate(session.startsAt)) || "—"}
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor={`session-time-${session.key}`}>Heure</label>
                    <input
                      id={`session-time-${session.key}`}
                      type="time"
                      required
                      value={sessionTime(session.startsAt)}
                      onChange={(e) =>
                        setSessions((rows) => patchSession(rows, index, { time: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-field md:col-span-3 flex flex-wrap items-center justify-between gap-3">
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={session.access === "FREE"}
                        onChange={(e) =>
                          setSessions((rows) =>
                            patchSession(rows, index, { access: e.target.checked ? "FREE" : "PAID" })
                          )
                        }
                      />
                      Entrée libre ce jour-là (pas de billet)
                    </label>
                    {sessions.length > 1 ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger text-xs"
                        onClick={() => {
                          const removed = session.key;
                          setSessions((rows) => rows.filter((_, i) => i !== index));
                          setTypes((rows) =>
                            rows.map((type) => ({
                              ...type,
                              sessionKeys: type.sessionKeys.filter((key) => key !== removed),
                            }))
                          );
                        }}
                      >
                        Retirer ce jour
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          hint="Téléversez l’affiche : elle s’affiche tout de suite sur le site public."
          persist={event?.id ? { target: "event", id: event.id, field: "poster" } : undefined}
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
          <label htmlFor="currency">Devise</label>
          <select
            id="currency"
            name={hasSales ? undefined : "currency"}
            value={currency}
            disabled={hasSales}
            onChange={(e) => setCurrency(normalizeEventCurrency(e.target.value))}
          >
            <option value="CDF">Franc congolais (CDF)</option>
            <option value="USD">Dollar (USD)</option>
          </select>
          <AdminHint>
            {hasSales
              ? "La devise ne peut plus changer : des billets ont déjà été vendus."
              : currency === "USD"
                ? "Les prix sont en dollars, nombre entier (ex. 10, 25)."
                : "Les prix sont en francs congolais, multiple de 5 (ex. 5 000, 12 500)."}
          </AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="salesOpensAt">Ouverture des ventes</label>
          <input
            id="salesOpensAt"
            name="salesOpensAt"
            type="datetime-local"
            defaultValue={toInputDate(event?.salesOpensAt)}
          />
          <AdminHint>Vide = vente dès la publication. Indépendant des journées ci-dessus.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="salesClosesAt">Fermeture des ventes</label>
          <input
            id="salesClosesAt"
            name="salesClosesAt"
            type="datetime-local"
            defaultValue={toInputDate(event?.salesClosesAt)}
          />
          <AdminHint>
            Vide = vente jusqu’à la fin du dernier jour payant. Renseignez une heure si la caisse
            doit fermer avant (ex. la veille).
          </AdminHint>
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
            Catégories de billets
          </h2>
          <div className="flex flex-wrap gap-2">
            {["Simple", "VIP", "VVIP"].map((name) => (
              <button
                key={name}
                type="button"
                className="admin-btn admin-btn-ghost text-xs"
                onClick={() =>
                  setTypes((rows) => {
                    const exists = rows.some(
                      (row) => row.name.trim().toLowerCase() === name.toLowerCase()
                    );
                    if (exists) return rows;
                    const blank = rows.length === 1 && !rows[0].name.trim() && !rows[0].id;
                    const next = { ...emptyType(), name };
                    return blank ? [next] : [...rows, next];
                  })
                }
              >
                + {name}
              </button>
            ))}
            <button
              type="button"
              className="admin-btn admin-btn-ghost text-xs"
              onClick={() => setTypes((rows) => [...rows, emptyType()])}
            >
              Ajouter un tarif
            </button>
          </div>
        </div>
        <AdminHint>
          Les catégories sont libres et propres à cet événement : VVIP, VIP, Simple, Early Bird,
          pass 2 jours… Ajoutez autant de tarifs que vous voulez. Cochez les jours payants
          concernés. Les jours en entrée libre n’ont pas de tarif.{" "}
          {currency === "USD"
            ? "Prix en dollars, nombre entier."
            : "Prix en francs congolais, multiple de 5."}
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
                      placeholder="VVIP, VIP, Simple…"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Prix ({currency})</label>
                    <input
                      type="number"
                      min={0}
                      step={currency === "USD" ? 1 : 5}
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
                  {paidDays.length ? (
                    <div className="admin-field md:col-span-2">
                      <p className="mb-2 text-sm">Valable pour</p>
                      <div className="flex flex-col gap-2">
                        {paidDays.map((day, dayIndex) => {
                          const checked =
                            type.sessionKeys.length === 0 || type.sessionKeys.includes(day.key);
                          const label = day.startsAt
                            ? new Date(day.startsAt).toLocaleString("fr-FR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : `Jour payant ${dayIndex + 1}`;
                          return (
                            <label key={day.key} className="admin-check">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const allKeys = paidDays.map((item) => item.key);
                                  const current =
                                    type.sessionKeys.length === 0 ? allKeys : type.sessionKeys;
                                  const next = e.target.checked
                                    ? Array.from(new Set([...current, day.key]))
                                    : current.filter((key) => key !== day.key);
                                  updateType(index, {
                                    sessionKeys: next.length === allKeys.length ? [] : next,
                                  });
                                }}
                              />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                      <AdminHint>
                        Rien décoché = valable tous les jours payants. Décochez pour un billet d’un
                        seul jour.
                      </AdminHint>
                    </div>
                  ) : (
                    <p className="admin-hint md:col-span-2">
                      Ajoutez au moins un jour payant ci-dessus pour lier ce tarif.
                    </p>
                  )}
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
