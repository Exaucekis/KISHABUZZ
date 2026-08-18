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
        hint="Renseignez l’affiche, le lieu, la capacité, puis les tarifs. La somme des tarifs ne peut pas dépasser la jauge."
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
