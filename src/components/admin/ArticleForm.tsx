"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveArticle } from "@/actions/admin/articles";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminHint } from "@/components/admin/AdminHint";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";
import { articlePreviewPath } from "@/lib/article-paths";

type Category = { id: string; name: string };
type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt?: string;
  coverFocus?: string;
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
          <AdminHint>Le titre public, affiché partout (liste, fiche, partage).</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="slug">Slug (optionnel)</label>
          <input id="slug" name="slug" defaultValue={article?.slug || ""} />
          <AdminHint>Adresse web. Laissez vide : il se crée tout seul depuis le titre.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="contentType">Type</label>
          <select id="contentType" name="contentType" defaultValue={article?.contentType || "ARTICLE"}>
            <option value="ARTICLE">Publication</option>
            <option value="CHRONIQUE">Chronique</option>
            <option value="ANALYSIS">Analyse</option>
          </select>
          <AdminHint>Publication → /publications. Chronique → /chroniques. Analyse → publications.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="status">Statut</label>
          <select id="status" name="status" defaultValue={article?.status || "DRAFT"}>
            <option value="DRAFT">Brouillon</option>
            <option value="SCHEDULED">Programmé</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
          <AdminHint>Seul « Publié » (ou « Programmé » à l’heure dite) apparaît sur le site.</AdminHint>
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
          <AdminHint>Classe l’article. Créez-en dans Catégories si la liste est vide.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="authorName">Auteur</label>
          <input id="authorName" name="authorName" defaultValue={article?.authorName || "KISHA BUZZ"} />
          <AdminHint>Nom affiché sous le titre. Ex. KISHA BUZZ.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="publishedAt">Date de publication</label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={toInputDate(article?.publishedAt)}
          />
          <AdminHint>Date visible sur la fiche. Laissez vide = date du jour à la publication.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="scheduledAt">Programmation</label>
          <input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            defaultValue={toInputDate(article?.scheduledAt)}
          />
          <AdminHint>Avec le statut « Programmé » : mise en ligne automatique à cette heure.</AdminHint>
        </div>
        <div className="admin-field md:col-span-2">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            defaultValue={article?.tags || ""}
            placeholder="culture, musique, kinshasa"
          />
          <AdminHint>Mots-clés séparés par des virgules. Ex. culture, musique, kinshasa.</AdminHint>
        </div>
        <ImageUploadField
          name="coverImage"
          label="Image de couverture"
          defaultValue={article?.coverImage || ""}
          altName="coverAlt"
          defaultAlt={article?.coverAlt || ""}
          focusName="coverFocus"
          defaultFocus={article?.coverFocus || "50% 50%"}
          hint="Grande image en haut de l’article. Recadrer pour garder le visage visible sur les cartes."
        />
        <div className="admin-field md:col-span-2">
          <label htmlFor="excerpt">Extrait</label>
          <textarea id="excerpt" name="excerpt" defaultValue={article?.excerpt || ""} />
          <AdminHint>2–3 phrases. S’affiche sur les cartes d’accueil et listes.</AdminHint>
        </div>
        <ArticleEditor name="content" defaultValue={article?.content || ""} />
        <div className="admin-field">
          <label htmlFor="metaTitle">Meta titre</label>
          <input id="metaTitle" name="metaTitle" defaultValue={article?.metaTitle || ""} />
          <AdminHint>Titre Google / réseaux. Laissez vide = titre de l’article.</AdminHint>
        </div>
        <div className="admin-field">
          <label htmlFor="metaDescription">Meta description</label>
          <input
            id="metaDescription"
            name="metaDescription"
            defaultValue={article?.metaDescription || ""}
          />
          <AdminHint>Résumé SEO, ~150 caractères. Laissez vide = extrait.</AdminHint>
        </div>
      </div>
      {!state.ok && state.message ? (
        <p className="text-sm text-red-300">{state.message}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 pt-3">
        <SubmitButton>Enregistrer</SubmitButton>
        {article?.id ? (
          <Link
            href={articlePreviewPath(article.contentType, article.slug)}
            target="_blank"
            rel="noreferrer"
            className="admin-btn admin-btn-ghost"
          >
            Voir comme sur le site
          </Link>
        ) : (
          <span className="text-sm text-[#9aa3b5]">Enregistrez une première fois pour l’aperçu.</span>
        )}
        <Link href="/admin/articles" className="admin-btn admin-btn-ghost">
          Retour
        </Link>
      </div>
    </form>
  );
}
