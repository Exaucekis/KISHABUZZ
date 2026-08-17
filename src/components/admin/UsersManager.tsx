"use client";

import { useActionState } from "react";
import { deleteUser, saveUser } from "@/actions/admin/users";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { EmailInput } from "@/components/auth/EmailInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ROLE_LABELS, ROLES, type Role } from "@/lib/roles";
import type { AdminActionState } from "@/lib/admin";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | string;
};

const initial: AdminActionState = { ok: false, message: "" };

export function UsersManager({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [state, action] = useActionState(saveUser, initial);

  return (
    <div className="space-y-8">
      <form action={action} className="admin-card space-y-3" noValidate>
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold">Nouveau compte</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="admin-field">
            <label htmlFor="name">Nom</label>
            <input id="name" name="name" required minLength={2} />
          </div>
          <div className="admin-field">
            <label htmlFor="email">Email</label>
            <EmailInput id="email" name="email" required autoComplete="email" />
          </div>
          <div className="admin-field">
            <label htmlFor="password">Mot de passe</label>
            <PasswordInput id="password" name="password" required minLength={6} autoComplete="new-password" />
          </div>
          <div className="admin-field">
            <label htmlFor="role">Rôle</label>
            <select id="role" name="role" defaultValue="USER">
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {state.message ? (
          <p className={`text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>{state.message}</p>
        ) : null}
        <SubmitButton>Créer l&apos;utilisateur</SubmitButton>
      </form>

      <div className="space-y-4">
        {users.map((user) => (
          <article key={user.id} className="admin-card space-y-3">
            <form action={action} className="grid gap-3 md:grid-cols-2" noValidate>
              <input type="hidden" name="id" value={user.id} />
              <div className="admin-field">
                <label>Nom</label>
                <input name="name" defaultValue={user.name} required />
              </div>
              <div className="admin-field">
                <label>Email</label>
                <EmailInput name="email" defaultValue={user.email} required autoComplete="email" />
              </div>
              <div className="admin-field">
                <label>Nouveau mot de passe</label>
                <PasswordInput name="password" minLength={6} placeholder="Laisser vide pour ne pas changer" autoComplete="new-password" />
              </div>
              <div className="admin-field">
                <label>Rôle</label>
                <select name="role" defaultValue={user.role}>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role as Role] || role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <SubmitButton>Enregistrer</SubmitButton>
              </div>
            </form>
            {user.id !== currentUserId ? (
              <form action={deleteUser}>
                <input type="hidden" name="id" value={user.id} />
                <SubmitButton variant="danger">Supprimer</SubmitButton>
              </form>
            ) : (
              <p className="text-xs text-[#9aa3b5]">C’est votre compte — suppression impossible.</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
