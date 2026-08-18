import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { getArenaGuestBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guest = await getArenaGuestBySlug(slug);
  if (!guest) return { title: "Invité" };
  return {
    title: `${guest.name} · Arena Culture`,
    description: guest.profession || guest.bio || `Invité Arena Culture — ${guest.name}`,
  };
}

export default async function ArenaInviteDetailPage({ params }: Props) {
  const { slug } = await params;
  const guest = await getArenaGuestBySlug(slug);
  if (!guest) notFound();

  const shows = guest.appearances.map((item) => item.show);

  return (
    <>
      <ArenaPageIntro
        title={guest.name}
        description={guest.profession || "Invité Arena Culture."}
      />

      <section className="ac-page">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[240px_1fr]">
          <div>
            {guest.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={guest.photo} alt={guest.name} className="w-full object-cover" />
            ) : (
              <div className="grid aspect-square place-items-center bg-ink-3 font-display text-5xl text-paper/30">
                {guest.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            {guest.bio ? (
              <p className="font-serif text-lg leading-relaxed text-paper-muted whitespace-pre-line">
                {guest.bio}
              </p>
            ) : (
              <p className="text-paper-muted">Invité des émissions Arena Culture.</p>
            )}

            {shows.length ? (
              <div className="mt-10">
                <h2 className="font-display text-2xl">Émissions</h2>
                <ul className="mt-5 space-y-3">
                  {shows.map((show) => (
                    <li key={show.id}>
                      <Link
                        href={`/arena-culture/emissions/${show.slug}`}
                        className="font-display text-xl hover:text-[var(--ac-amber)]"
                      >
                        {show.title}
                      </Link>
                      <p className="text-sm text-paper-muted">
                        {[show.theme, show.airDate ? formatDate(show.airDate) : ""]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-10">
              <Link href="/arena-culture/invites" className="text-[var(--ac-amber)] hover:underline">
                Tous les invités
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
