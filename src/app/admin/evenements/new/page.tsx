import { EventAdminNav } from "@/components/admin/EventAdminNav";
import { EventForm } from "@/components/admin/EventForm";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { auth } from "@/lib/auth";
import { listEventOrganizerOptions } from "@/lib/organizer";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Nouvel événement" };

export default async function NewEventPage() {
  const session = await auth();
  const [categories, organizers] = await Promise.all([
    prisma.eventCategory.findMany({
      where: { visible: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    listEventOrganizerOptions(session?.user?.id),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Nouvel événement"
        hint="Journées (payantes ou entrée libre), fenêtre de vente, jauge, puis tarifs liés aux jours payants."
      />
      <EventAdminNav current="/admin/evenements" />
      <EventForm
        categories={categories}
        organizers={organizers}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
