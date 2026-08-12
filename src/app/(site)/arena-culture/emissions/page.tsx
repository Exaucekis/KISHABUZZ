import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublishedShows } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Émissions · Arena Culture",
  description: "Toutes les émissions Arena Culture publiées.",
};

export default async function ArenaEmissionsPage() {
  const shows = await getPublishedShows();

  return (
    <>
      <ArenaPageIntro
        title="Émissions"
        description="Épisodes, thèmes et invités — le plateau Arena Culture."
      />

      <section className="ac-page">
        {shows.length ? (
          <div className="ac-grid-shows">
            {shows.map((show) => {
              const guestNames = show.guests.map((g) => g.guest.name).filter(Boolean);
              return (
                <Link
                  key={show.id}
                  href={`/arena-culture/emissions/${show.slug}`}
                  className="ac-show-card focus-ring"
                >
                  <div className="ac-show-card__media">
                    {show.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={show.poster} alt="" loading="lazy" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/artists/fally-ipupa.jpg" alt="" loading="lazy" />
                    )}
                  </div>
                  <div className="ac-show-card__body">
                    <p className="ac-kicker">
                      Épisode {String(show.number).padStart(2, "0")}
                      {show.season ? ` · Saison ${show.season.number}` : ""}
                    </p>
                    <h2>{show.title}</h2>
                    {show.theme ? <p>{show.theme}</p> : null}
                    <p>
                      {[show.airDate ? formatDate(show.airDate) : null, guestNames.join(", ")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Aucune émission publiée"
            description="Les émissions Arena Culture apparaîtront ici dès leur mise en ligne."
          />
        )}
      </section>
    </>
  );
}
