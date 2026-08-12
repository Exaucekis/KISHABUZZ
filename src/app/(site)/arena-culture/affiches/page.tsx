import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { getGallery, getPublishedShows } from "@/lib/data";

export const metadata: Metadata = {
  title: "Affiches · Arena Culture",
  description: "Affiches des émissions Arena Culture.",
};

export default async function ArenaAffichesPage() {
  const [shows, galleryPosters] = await Promise.all([
    getPublishedShows(),
    getGallery({ category: "ARENA_CULTURE", kind: "IMAGE" }),
  ]);

  const fromShows = shows.filter((s) => s.poster);

  return (
    <>
      <ArenaPageIntro title="Affiches" description="Visuels officiels des émissions." />

      <section className="ac-page">
        {fromShows.length || galleryPosters.length ? (
          <div className="ac-grid-posters">
            {fromShows.map((s) => (
              <Link key={s.id} href={`/arena-culture/emissions/${s.slug}`} className="focus-ring">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.poster} alt={s.title} loading="lazy" />
                <p>{s.title}</p>
              </Link>
            ))}
            {!fromShows.length
              ? galleryPosters.map((p) => (
                  <div key={p.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail || p.url} alt={p.title} loading="lazy" />
                    <p>{p.title}</p>
                  </div>
                ))
              : null}
          </div>
        ) : (
          <EmptyState title="Aucune affiche publiée" />
        )}
      </section>
    </>
  );
}
