import { PagesManager } from "@/components/admin/PagesManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const pages = await prisma.pageContent.findMany({ orderBy: { key: "asc" } });
  return (
    <div>
      <AdminPageIntro
        title="Contenus de pages"
        hint="Textes des sections À propos (clés about.qui, about.parcours…). Ne changez pas une clé déjà utilisée."
      />
      <PagesManager pages={pages} />
    </div>
  );
}
