import type { Metadata } from "next";
import Link from "next/link";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { getArenaGuests } from "@/lib/data";

export const metadata: Metadata = {
  title: "Invités · Arena Culture",
  description: "Invités des émissions Arena Culture.",
};

export default async function ArenaInvitesPage() {
  const guests = await getArenaGuests();
  const withPublished = guests
    .map((g) => ({
      ...g,
      shows: g.appearances
        .filter((a) => a.show.status === "PUBLISHED")
        .map((a) => a.show),
    }))
    .filter((g) => g.shows.length > 0);

  return (
    <>
      <ArenaPageIntro
        title="Invités"
        description="Talents et personnalités passés sur le plateau."
      />

      <section className="ac-page">
        {withPublished.length ? (
          <div className="ac-grid-guests">
            {withPublished.map((guest) => (
              <article key={guest.id} className="ac-guest-card">
                <div className="ac-guest-card__media">
                  {guest.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={guest.photo} alt="" loading="lazy" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/artists/gaz-mawete.jpg" alt="" loading="lazy" />
                  )}
                </div>
                <div className="ac-guest-card__body">
                  <h2>{guest.name}</h2>
                  {guest.profession ? <p>{guest.profession}</p> : null}
                  {guest.bio ? <p className="line-clamp-3">{guest.bio}</p> : null}
                  {guest.shows.length ? (
                    <ul className="mt-3 space-y-1 text-sm">
                      {guest.shows.slice(0, 3).map((s) => (
                        <li key={s.id}>
                          <Link
                            href={`/arena-culture/emissions/${s.slug}`}
                            className="text-[var(--ac-amber)] hover:underline"
                          >
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun invité publié"
            description="Les invités apparaîtront ici dès qu'ils seront associés à une émission publiée."
          />
        )}
      </section>
    </>
  );
}
