"use client";

import { useActionState } from "react";
import { addEventStaff, removeEventStaff } from "@/actions/admin/event-staff";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type StaffRow = {
  userId: string;
  role: string;
  user: { name: string; email: string };
};

const initial: AdminActionState = { ok: false, message: "" };

export function EventStaffManager({ eventId, staff }: { eventId: string; staff: StaffRow[] }) {
  const [state, action] = useActionState(addEventStaff, initial);

  return (
    <section className="admin-card mt-8">
      <h2 className="font-display text-lg uppercase">Contrôle d’entrée</h2>
      <p className="admin-card-hint mt-1">
        Ajoutez un compte existant. Un scanner n’accède qu’à /scan, un manager aura aussi le tableau de bord organisateur.
      </p>
      <a href={`/scan?event=${eventId}`} className="mt-3 mr-4 inline-block text-sm font-semibold text-ember-text">
        Ouvrir le scan de cet événement
      </a>
      <a href={`/organisateur/evenements/${eventId}`} className="mt-3 inline-block text-sm font-semibold text-ember-text">
        Tableau organisateur
      </a>

      <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
        <input type="hidden" name="eventId" value={eventId} />
        <div className="admin-field">
          <label htmlFor="staff-email">Email</label>
          <input id="staff-email" name="email" type="email" required placeholder="controleur@example.com" />
        </div>
        <div className="admin-field">
          <label htmlFor="staff-role">Rôle</label>
          <select id="staff-role" name="role" defaultValue="SCANNER">
            <option value="SCANNER">Scanner</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>
        <div className="flex items-end">
          <SubmitButton>Ajouter</SubmitButton>
        </div>
      </form>
      {state.message ? (
        <p className={`mt-3 text-sm ${state.ok ? "text-emerald-300" : "text-red-400"}`}>{state.message}</p>
      ) : null}

      {staff.length ? (
        <ul className="mt-5 divide-y divide-white/10">
          {staff.map((row) => (
            <li key={row.userId} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>
                <strong>{row.user.name}</strong>
                <span className="mt-0.5 block text-xs text-[#9aa3b5]">
                  {row.user.email} · {row.role === "MANAGER" ? "Manager" : "Scanner"}
                </span>
              </span>
              <form action={removeEventStaff}>
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="userId" value={row.userId} />
                <button type="submit" className="admin-btn admin-btn-ghost text-xs">
                  Retirer
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[#9aa3b5]">Aucun staff pour l’instant. Les admins CMS peuvent déjà scanner.</p>
      )}
    </section>
  );
}
