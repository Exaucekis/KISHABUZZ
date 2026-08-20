import Link from "next/link";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { ArenaShowsTable } from "@/components/admin/ArenaShowsTable";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { videoPoster } from "@/lib/media";

export const metadata = { title: "Archives Arena" };

export default async function AdminArenaArchivesPage() {
  const [shows, videos, visuals] = await Promise.all([
    prisma.arenaShow.findMany({
      where: { status: "ARCHIVED" },
      include: { season: true },
      orderBy: [{ airDate: "desc" }, { number: "desc" }],
    }),
    prisma.mediaAsset.findMany({
      where: {
        kind: "VIDEO",
        featured: false,
        OR: [{ category: "ARENA_CULTURE" }, { arenaShowId: { not: null } }],
      },
      include: { arenaShow: { select: { id: true, title: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.mediaAsset.findMany({
      where: { kind: "IMAGE", title: { startsWith: "Archive ·" } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <AdminPageIntro
        title="Archives Arena"
        hint="Trois tiroirs : émissions remplacées par une nouvelle vidéo, anciennes vidéos, et visuels de page remplacés. Rien ne disparaît : ça descend ici."
        actions={
          <Link href="/arena-culture/archives" className="admin-btn admin-btn-ghost" target="_blank" rel="noreferrer">
            Voir les archives
          </Link>
        }
      />
      <ArenaAdminNav current="/admin/arena/archives" />

      <section className="mb-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa3b5]">01 · Émissions</p>
            <h2 className="mt-1 font-[family-name:var(--font-syne)] text-lg font-bold">
              Épisodes archivés ({shows.length})
            </h2>
            <p className="mt-1 text-sm text-[#9aa3b5]">
              Chaque nouvelle vidéo à la une envoie l’émission précédente ici. Elles restent en rediffusion.
            </p>
          </div>
          <Link href="/admin/arena/emissions" className="admin-btn admin-btn-ghost text-xs">
            Toutes les émissions
          </Link>
        </div>
        <ArenaShowsTable shows={shows} />
      </section>

      <section className="mb-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa3b5]">02 · Vidéos</p>
            <h2 className="mt-1 font-[family-name:var(--font-syne)] text-lg font-bold">
              Vidéos archivées ({videos.length})
            </h2>
            <p className="mt-1 text-sm text-[#9aa3b5]">
              Fichiers et liens (YouTube, Facebook, Instagram, TikTok) qui ne sont plus en première.
            </p>
          </div>
          <Link href="/admin/arena/videos" className="admin-btn admin-btn-ghost text-xs">
            Gérer les vidéos
          </Link>
        </div>
        {videos.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {videos.map((video) => {
              const poster = videoPoster(video.url, video.thumbnail);
              return (
                <div key={video.id} className="admin-card flex gap-3">
                  {poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={poster} alt="" className="h-20 w-32 shrink-0 rounded object-cover" />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-semibold">{video.title}</p>
                    <p className="text-xs text-[#9aa3b5]">
                      {video.arenaShow ? `Émission · ${video.arenaShow.title}` : "Vidéo seule"}
                      {video.date ? ` · ${formatDate(video.date, "d MMM yyyy")}` : ""}
                    </p>
                    {video.arenaShow ? (
                      <Link
                        href={`/admin/arena/${video.arenaShow.id}`}
                        className="mt-2 inline-block text-xs text-amber-200 hover:underline"
                      >
                        Ouvrir l’émission
                      </Link>
                    ) : (
                      <Link href="/admin/arena/videos" className="mt-2 inline-block text-xs text-amber-200 hover:underline">
                        Ouvrir les vidéos
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="admin-card text-sm text-[#9aa3b5]">Aucune vidéo archivée pour l’instant.</p>
        )}
      </section>

      <section>
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa3b5]">03 · Visuels</p>
          <h2 className="mt-1 font-[family-name:var(--font-syne)] text-lg font-bold">
            Visuels de page remplacés ({visuals.length})
          </h2>
          <p className="mt-1 text-sm text-[#9aa3b5]">
            Images de rubriques Arena quand vous en téléversez une nouvelle.
          </p>
        </div>
        {visuals.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visuals.map((item) => (
              <div key={item.id} className="admin-card p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail || item.url}
                  alt={item.alt || item.title}
                  className="h-28 w-full rounded object-cover"
                />
                <p className="mt-2 text-xs text-[#c5ccd8]">{item.title.replace(/^Archive · /, "")}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-card text-sm text-[#9aa3b5]">Aucun visuel archivé pour l’instant.</p>
        )}
      </section>
    </div>
  );
}
