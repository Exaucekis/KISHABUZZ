"use client";

import { useActionState } from "react";
import { deletePageContent, savePageContent } from "@/actions/admin/pages";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Page = {
  id: string;
  key: string;
  title: string;
  body: string;
};

const initial: AdminActionState = { ok: false, message: "" };

function PageForm({ page }: { page?: Page }) {
  const [state, action] = useActionState(savePageContent, initial);
  return (
    <form action={action} className="admin-card">
      {page?.id ? <input type="hidden" name="id" value={page.id} /> : null}
      <div className="admin-field">
        <label>Clé</label>
        <input name="key" required defaultValue={page?.key || ""} placeholder="a-propos" />
      </div>
      <div className="admin-field">
        <label>Titre</label>
        <input name="title" defaultValue={page?.title || ""} />
      </div>
      <div className="admin-field">
        <label>Contenu</label>
        <textarea name="body" className="min-h-[12rem]" defaultValue={page?.body || ""} />
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{page ? "Mettre à jour" : "Créer"}</SubmitButton>
    </form>
  );
}

export function PagesManager({ pages }: { pages: Page[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouvelle page
        </h2>
        <PageForm />
      </div>
      <div className="space-y-3">
        {pages.map((p) => (
          <div key={p.id}>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <code className="text-xs text-[#9aa3b5]">{p.key}</code>
              <form action={deletePageContent}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <PageForm page={p} />
          </div>
        ))}
        {!pages.length ? <p className="text-sm text-[#9aa3b5]">Aucune page.</p> : null}
      </div>
    </div>
  );
}
