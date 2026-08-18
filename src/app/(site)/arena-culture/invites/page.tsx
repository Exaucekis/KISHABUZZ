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

  return (
    <>
      <ArenaPageIntro
        title="Invités"
        description="Talents et personnalités passés sur le plateau."
      />

      <section className="ac-page">
        {guests.length ? (
          <div className="ac-grid-guests">
            {guests.map((guest) => {
              const shows = guest.appearances
                .filter((item) => item.show.status === "PUBLISHED")
                .map((item) => item.show);
              return (
                <article key={guest.id} className="ac-guest-card">
                  <Link href={`/arena-culture/invites/${guest.slug}`} className="ac-guest-card__media">
                    {guest.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={guest.photo} alt={guest.name} loading="lazy" />
                    ) : (
                      <div className="grid h-full min-h-48 place-items-center bg-ink-3 font-display text-4xl text-paper/30">
                        {guest.name.slice(0, 1)}
                      </div>
                    )}
                  </Link>
                  <div className="ac-guest-card__body">
                    <h2>
                      <Link href={`/arena-culture/invites/${guest.slug}`} className="hover:text-[var(--ac-amber)]">
                        {guest.name}
                      </Link>
                    </h2>
                    {guest.profession ? <p>{guest.profession}</p> : null}
                    {guest.bio ? <p className="line-clamp-3">{guest.bio}</p> : null}
                    {shows.length ? (
                      <ul className="mt-3 space-y-1 text-sm">
                        {shows.slice(0, 3).map((s) => (
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
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Aucun invité publié"
            description="Les invités apparaîtront ici dès leur publication depuis l’administration."
          />
        )}
      </section>
    </>
  );
}
