"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveArticle } from "@/actions/admin/articles";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";

type Category = { id: string; name: string };
type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  contentType: string;
  status: string;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  metaTitle: string;
  metaDescription: string;
  authorName: string;
  categoryId: string | null;
  tags?: string;
};

function toInputDate(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
}

const initial: AdminActionState = { ok: false, message: "" };

export function ArticleForm({
  article,
  categories,
}: {
  article?: Article;
  categories: Category[];
}) {
  const [state, action] = useActionState(saveArticle, initial);

  return (
    <form action={action} className="admin-card space-y-1">
      {article?.id ? <input type="hidden" name="id" value={article.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="admin-field md:col-span-2">
          <label htmlFor="title">Titre</label>
          <input id="title" name="title" required defaultValue={article?.title || ""} />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">Slug (optionnel)</label>
          <input id="slug" name="slug" defaultValue={article?.slug || ""} />
        </div>
        <div className="admin-field">
          <label htmlFor="contentType">Type</label>
          <select id="contentType" name="contentType" defaultValue={article?.contentType || "ARTICLE"}>
            <option value="ARTICLE">Publication</option>
            <option value="CHRONIQUE">Chronique</option>
            <option value="ANALYSIS">Analyse</option>
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="status">Statut</label>
          <select id="status" name="status" defaultValue={article?.status || "DRAFT"}>
            <option value="DRAFT">Brouillon</option>
            <option value="SCHEDULED">Programmé</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="categoryId">Catégorie</label>
          <select id="categoryId" name="categoryId" defaultValue={article?.categoryId || ""}>
            <option value="">— Aucune —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="authorName">Auteur</label>
          <input id="authorName" name="authorName" defaultValue={article?.authorName || "KISHA BUZZ"} />
        </div>
        <div className="admin-field">
          <label htmlFor="publishedAt">Date de publication</label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={toInputDate(article?.publishedAt)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="scheduledAt">Programmation</label>
          <input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            defaultValue={toInputDate(article?.scheduledAt)}
          />
          <p className="mt-1 text-xs text-[#9aa3b5]">
            Statut « Programmé » + cette date : l’article passe en ligne automatiquement à l’heure dite.
          </p>
        </div>
        <div className="admin-field md:col-span-2">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            defaultValue={article?.tags || ""}
            placeholder="culture, musique, kinshasa"
          />
          <p className="mt-1 text-xs text-[#9aa3b5]">Séparés par des virgules.</p>
        </div>
        <ImageUploadField
          name="coverImage"
          label="Image de couverture"
          defaultValue={article?.coverImage || ""}
          hint="URL ou fichier (JPG, PNG, WebP, GIF — 4 Mo max)."
        />
        <div className="admin-field md:col-span-2">
          <label htmlFor="excerpt">Extrait</label>
          <textarea id="excerpt" name="excerpt" defaultValue={article?.excerpt || ""} />
        </div>
        <ArticleEditor name="content" defaultValue={article?.content || ""} />
        <div className="admin-field">
          <label htmlFor="metaTitle">Meta titre</label>
          <input id="metaTitle" name="metaTitle" defaultValue={article?.metaTitle || ""} />
        </div>
        <div className="admin-field">
          <label htmlFor="metaDescription">Meta description</label>
          <input
            id="metaDescription"
            name="metaDescription"
            defaultValue={article?.metaDescription || ""}
          />
        </div>
      </div>
      {!state.ok && state.message ? (
        <p className="text-sm text-red-300">{state.message}</p>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-3">
        <SubmitButton>Enregistrer</SubmitButton>
        <Link href="/admin/articles" className="admin-btn admin-btn-ghost">
          Retour
        </Link>
      </div>
    </form>
  );
}
