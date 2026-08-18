import { ArticleForm } from "@/components/admin/ArticleForm";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Nouvel article" };

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <AdminPageIntro
        title="Nouvel article / chronique"
        hint="Remplissez le titre, le type, puis le texte. Passez en « Publié » pour le mettre en ligne."
      />
      <ArticleForm categories={categories} />
    </div>
  );
}
