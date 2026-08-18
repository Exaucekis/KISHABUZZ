"use client";

import { useActionState } from "react";
import { deleteCategory, saveCategory } from "@/actions/admin/categories";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
};

const initial: AdminActionState = { ok: false, message: "" };

function CategoryForm({ category }: { category?: Category }) {
  const [state, action] = useActionState(saveCategory, initial);
  return (
    <form action={action} className="admin-card">
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="admin-field">
        <label>Nom</label>
        <input name="name" required defaultValue={category?.name || ""} />
        <AdminHint>Nom affiché sur les articles. Ex. Culture, Musique.</AdminHint>
      </div>
      <div className="admin-field">
        <label>Type</label>
        <select name="type" defaultValue={category?.type || "publication"}>
          <option value="publication">Publication</option>
          <option value="chronique">Chronique</option>
          <option value="general">Général</option>
        </select>
        <AdminHint>Pour quel type d’article cette catégorie sert.</AdminHint>
      </div>
      <div className="admin-field">
        <label>Description</label>
        <textarea name="description" defaultValue={category?.description || ""} />
        <AdminHint>Optionnel. Aide en interne, rarement affiché.</AdminHint>
      </div>
      {state.message ? (
        <p className={`mb-2 text-sm ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>{category ? "Mettre à jour" : "Créer"}</SubmitButton>
    </form>
  );
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Nouvelle catégorie
        </h2>
        <CategoryForm />
      </div>
      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id}>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <p className="text-sm text-[#9aa3b5]">
                {c.slug} · {c.type}
              </p>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="admin-btn admin-btn-danger text-xs">
                  Suppr.
                </button>
              </form>
            </div>
            <CategoryForm category={c} />
          </div>
        ))}
        {!categories.length ? <p className="text-sm text-[#9aa3b5]">Aucune catégorie.</p> : null}
      </div>
    </div>
  );
}
