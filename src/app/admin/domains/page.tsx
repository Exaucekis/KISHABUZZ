import { DomainsManager } from "@/components/admin/DomainsManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Domaines" };

export default async function AdminDomainsPage() {
  const domains = await prisma.domain.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return (
    <div>
      <AdminPageIntro
        title="Domaines"
        hint="Vos expertises (bandeau d’accueil et page À propos). Glissez pour changer l’ordre."
      />
      <DomainsManager domains={domains} />
    </div>
  );
}
