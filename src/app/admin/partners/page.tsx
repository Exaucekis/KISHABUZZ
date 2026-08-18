import { PartnersManager } from "@/components/admin/PartnersManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Partenaires" };

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return (
    <div>
      <AdminPageIntro
        title="Partenaires"
        hint="Ajoutez nom, logo (fichier ou lien) et cochez Visible pour afficher sur Collaborations."
      />
      <PartnersManager partners={partners} />
    </div>
  );
}
