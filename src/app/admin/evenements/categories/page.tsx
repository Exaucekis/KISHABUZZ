import { EventAdminNav } from "@/components/admin/EventAdminNav";
import { EventCategoriesManager } from "@/components/admin/EventCategoriesManager";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Catégories événements" };

export default async function AdminEventCategoriesPage() {
  const categories = await prisma.eventCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <AdminPageIntro
        title="Catégories d’événements"
        hint="Concert, festival, conférence… Ces filtres apparaissent sur la page Événements."
      />
      <EventAdminNav current="categories" />
      <EventCategoriesManager categories={categories} />
    </div>
  );
}
