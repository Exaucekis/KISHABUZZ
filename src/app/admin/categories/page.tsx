import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Catégories" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <AdminPageIntro
        title="Catégories"
        hint="Rubriques pour classer articles et chroniques. Créez-les avant de rédiger."
      />
      <CategoriesManager categories={categories} />
    </div>
  );
}
