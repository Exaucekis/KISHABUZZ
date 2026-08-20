import type { Metadata } from "next";
import { connection } from "next/server";
import { ArenaCalendarCard } from "@/components/arena/ArenaCalendarCard";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUpcomingArenaDates } from "@/lib/data";

export const metadata: Metadata = {
  title: "Prochaines dates · Arena Culture",
  description:
    "Calendrier Arena Culture : prochaines émissions, lieu, heure et billets si le plateau est payant.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArenaCalendrierPage() {
  await connection();
  const dates = await getUpcomingArenaDates();

  return (
    <>
      <ArenaPageIntro
        title="Prochaines dates"
        description="Les plateaux à venir, avec l’heure, le lieu, et un accès billets quand l’entrée est payante."
      />
      <section className="ac-page">
        {dates.length ? (
          <div className="ac-cal-list">
            {dates.map((show) => (
              <ArenaCalendarCard key={show.id} show={show} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucune date annoncée"
            description="Dès qu’une émission est planifiée, elle apparaîtra ici avec le lieu et l’heure."
          />
        )}
      </section>
    </>
  );
}
