import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedEvents, getVisibleEventCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Événements",
  description: "Billetterie KISHA BUZZ : concerts, soirées, festivals et événements culturels.",
};

type Props = {
  searchParams: Promise<{ categorie?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const { categorie } = await searchParams;
  const [events, categories] = await Promise.all([
    getPublishedEvents({ categorySlug: categorie || undefined }),
    getVisibleEventCategories(),
  ]);

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Billetterie"
            title="Événements"
            description="Réservez vos places pour les soirées, concerts et rendez-vous culturels KISHA BUZZ."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {categories.length ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/evenements"
              className={cn(
                "rounded-md border px-3 py-2 text-sm",
                !categorie
                  ? "border-ember bg-ember text-on-ember"
                  : "border-line text-paper-muted hover:text-paper"
              )}
            >
              Tous
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/evenements?categorie=${category.slug}`}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  categorie === category.slug
                    ? "border-ember bg-ember text-on-ember"
                    : "border-line text-paper-muted hover:text-paper"
                )}
              >
                {category.name}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20">
        {events.length ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                href={`/evenements/${event.slug}`}
                title={event.title}
                summary={event.summary}
                poster={event.poster}
                category={event.category?.name}
                startsAt={event.startsAt}
                venueName={event.venueName}
                city={event.city}
                address={event.address}
                currency={event.currency}
                featured={event.featured}
                ticketTypes={event.ticketTypes}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun événement publié"
            description="Les prochains rendez-vous et la billetterie en ligne apparaîtront ici."
          />
        )}
      </section>
    </>
  );
}
