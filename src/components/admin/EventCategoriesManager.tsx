"use client";

import { useActionState } from "react";
import { deleteEventCategory, saveEventCategory } from "@/actions/admin/events";
import { AdminHint } from "@/components/admin/AdminHint";
import { SaveResultFromState } from "@/components/admin/SaveResultDialog";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Category = {
  id: string;
  name: string;
  description: string;
  visible: boolean;
};

const initial: AdminActionState = { ok: false, message: "" };

function CategoryForm({ category }: { category?: Category }) {
  const [state, action] = useActionState(saveEventCategory, initial);
  return (
    <form action={action} className="admin-card">
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="admin-field">
        <label>Nom</label>
        <input name="name" required defaultValue={category?.name || ""} />
        <AdminHint>Ex. Concert, Festival, Conférence.</AdminHint>
      </div>
      <div className="admin-field">
        <label>Description</label>
        <textarea name="description" defaultValue={category?.description || ""} />
      </div>
      <div className="admin-field">
        <label className="admin-check">
          <input type="checkbox" name="visible" defaultChecked={category?.visible ?? true} />
          Visible
        </label>
      </div>
      {state.message && !state.ok ? (
        <p className="mb-2 text-sm text-red-300">{state.message}</p>
      ) : null}
      <SaveResultFromState state={state} titleOk="Catégorie enregistrée" />
      <SubmitButton>{category ? "Mettre à jour" : "Créer"}</SubmitButton>
    </form>
  );
}

export function EventCategoriesManager({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouvelle catégorie
        </h2>
        <CategoryForm />
      </div>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="admin-card">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{category.name}</p>
                <p className="text-sm text-[#9aa3b5]">
                  {category.visible ? "Visible" : "Masquée"}
                </p>
              </div>
              <form action={deleteEventCategory}>
                <input type="hidden" name="id" value={category.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <CategoryForm category={category} />
          </div>
        ))}
        {!categories.length ? <p className="text-sm text-[#9aa3b5]">Aucune catégorie.</p> : null}
      </div>
    </div>
  );
}
