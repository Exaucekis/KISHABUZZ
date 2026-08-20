import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { getArchivedShows, getArenaStage, getPublishedShows } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Émissions · Arena Culture",
  description: "Toutes les émissions Arena Culture publiées.",
};

export const dynamic = "force-dynamic";

function ShowCard({
  show,
  kicker,
}: {
  show: {
    id: string;
    slug: string;
    title: string;
    theme: string;
    poster: string;
    number: number;
    airDate: Date | null;
    season: { number: number } | null;
    guests: { guest: { name: string } }[];
  };
  kicker?: string;
}) {
  const guestNames = show.guests.map((g) => g.guest.name).filter(Boolean);
  return (
    <Link href={`/arena-culture/emissions/${show.slug}`} className="ac-show-card focus-ring">
      <div className="ac-show-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={show.poster || "/artists/fally-ipupa.jpg"} alt="" loading="lazy" />
      </div>
      <div className="ac-show-card__body">
        <p className="ac-kicker">
          {kicker ||
            `Épisode ${String(show.number).padStart(2, "0")}${
              show.season ? ` · Saison ${show.season.number}` : ""
            }`}
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
}

export default async function ArenaEmissionsPage() {
  const [shows, stage, archived] = await Promise.all([
    getPublishedShows(),
    getArenaStage(),
    getArchivedShows({ take: 12 }),
  ]);
  const headline = stage.headline;
  const announced = stage.announced;
  const rest = shows.filter((show) => show.id !== headline?.id && show.id !== announced?.id);
  const replays = archived.filter((show) => show.id !== headline?.id && show.id !== announced?.id);

  return (
    <>
      <ArenaPageIntro
        title="Émissions"
        description="L’émission en première, le prochain invité, puis les rediffusions dans les archives."
      />

      <section className="ac-page space-y-14">
        {headline ? (
          <div>
            <p className="ac-kicker mb-4">En première</p>
            <div className="ac-grid-shows">
              <ShowCard
                show={headline}
                kicker={`Épisode ${String(headline.number).padStart(2, "0")}`}
              />
            </div>
          </div>
        ) : null}

        {announced ? (
          <div>
            <p className="ac-kicker mb-4">Prochain invité</p>
            <div className="ac-grid-shows">
              <ShowCard show={announced} kicker="Annoncé" />
            </div>
          </div>
        ) : null}

        {rest.length ? (
          <div className="ac-grid-shows">
            {rest.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        ) : null}

        {replays.length ? (
          <div>
            <div className="mb-6 flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl md:text-3xl">Rediffusions</h2>
              <Link href="/arena-culture/archives" className="text-sm text-[var(--ac-amber)] hover:underline">
                Toutes les archives
              </Link>
            </div>
            <div className="ac-grid-shows">
              {replays.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </div>
        ) : null}

        {!headline && !announced && !rest.length && !replays.length ? (
          <EmptyState
            title="Aucune émission publiée"
            description="Les émissions Arena Culture apparaîtront ici dès leur mise en ligne."
          />
        ) : null}
      </section>
    </>
  );
}
