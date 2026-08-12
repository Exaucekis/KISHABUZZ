import { PartnersManager } from "@/components/admin/PartnersManager";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Partenaires" };

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-syne)] text-2xl font-bold">Partenaires</h1>
      <PartnersManager partners={partners} />
    </div>
  );
}
