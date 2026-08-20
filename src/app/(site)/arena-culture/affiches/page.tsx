import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { getArchivedShows, getPublishedShows } from "@/lib/data";

export const metadata: Metadata = {
  title: "Affiches · Arena Culture",
  description: "Affiches des émissions Arena Culture.",
};

export default async function ArenaAffichesPage() {
  const [shows, archivedShows] = await Promise.all([getPublishedShows(), getArchivedShows()]);
  const posters = [...shows, ...archivedShows].filter((s) => s.poster);

  return (
    <>
      <ArenaPageIntro title="Affiches" description="Visuels officiels des émissions." />

      <section className="ac-page">
        {posters.length ? (
          <div className="ac-grid-posters">
            {posters.map((s) => (
              <Link key={s.id} href={`/arena-culture/emissions/${s.slug}`} className="focus-ring">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.poster} alt={s.title} loading="lazy" />
                <p>{s.title}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="Aucune affiche publiée" />
        )}
      </section>
    </>
  );
}
