import Link from "next/link";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { ArenaShowForm } from "@/components/admin/ArenaShowForm";
import { ArenaShowsTable } from "@/components/admin/ArenaShowsTable";
import { prisma } from "@/lib/prisma";
import { videoPoster } from "@/lib/media";

export const metadata = { title: "Émissions Arena" };

export default async function AdminArenaShowsPage() {
  const [shows, guests, domains] = await Promise.all([
    prisma.arenaShow.findMany({
      include: {
        season: true,
        guests: { include: { guest: { select: { name: true, profession: true } } } },
      },
      orderBy: [{ number: "desc" }, { airDate: "desc" }],
    }),
    prisma.arenaGuest.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, profession: true },
    }),
    prisma.domain.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const live = shows.filter((show) => show.status !== "ARCHIVED");

  return (
    <div>
      <AdminPageIntro
        title="Émissions"
        hint="Cet onglet a son propre formulaire : nom de l’invité, domaine, vidéo et miniature. À la une et Prochain invité se gèrent ailleurs."
        actions={
          <Link href="/arena-culture/emissions" className="admin-btn admin-btn-ghost" target="_blank" rel="noreferrer">
            Voir la page
          </Link>
        }
      />
      <ArenaAdminNav current="/admin/arena/emissions" />

      <div className="mb-8">
        <ArenaShowForm guests={guests} domains={domains} />
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9aa3b5]">
            Émissions en ligne · {live.length}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-syne)] text-lg font-bold">
            Vos émissions
          </h2>
        </div>
        {live.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {live.map((show) => {
              const guest = show.guests[0]?.guest;
              const cover = videoPoster(show.videoUrl, show.videoThumbnail) || show.poster;
              return (
                <article key={show.id} className="admin-card flex gap-3">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-24 w-40 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="grid h-24 w-40 shrink-0 place-items-center rounded bg-black/30 text-xs text-[#9aa3b5]">
                      Sans miniature
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#9aa3b5]">
                      {show.isFeatured ? "En première · " : ""}
                      {guest?.profession || show.theme || "Émission"}
                    </p>
                    <p className="font-semibold">{guest?.name || show.title}</p>
                    {show.theme && guest?.name ? (
                      <p className="text-sm text-[#9aa3b5]">{show.title !== guest.name ? show.title : show.theme}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link href={`/admin/arena/${show.id}`} className="admin-btn admin-btn-ghost text-xs">
                        Modifier
                      </Link>
                      {show.videoUrl ? (
                        <a
                          href="/arena-culture/emissions"
                          className="admin-btn admin-btn-ghost text-xs"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Voir
                        </a>
                      ) : (
                        <span className="text-xs text-red-300">Pas de vidéo</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="admin-card text-sm text-[#9aa3b5]">
            Aucune émission pour l’instant. Publiez-en une avec le formulaire ci-dessus.
          </p>
        )}
      </section>

      {shows.length ? (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
            Toutes les émissions
          </h2>
          <ArenaShowsTable shows={shows} />
        </section>
      ) : null}
    </div>
  );
}
