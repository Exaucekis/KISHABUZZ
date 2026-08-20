import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

type Show = {
  id: string;
  title: string;
  status: string;
  airDate: Date | null;
  guests: { guest: { name: string } }[];
};

export function ArenaCulturePanel({
  publishedShows,
  draftShows,
  publishedGuests,
  videos,
  albums,
  videosWithoutPoster,
  latestShow,
}: {
  publishedShows: number;
  draftShows: number;
  publishedGuests: number;
  videos: number;
  albums: number;
  videosWithoutPoster: number;
  latestShow: Show | null;
}) {
  const cards = [
    { label: "Émissions publiées", value: publishedShows, href: "/admin/arena/emissions", hint: "En ligne sur Arena Culture." },
    { label: "Émissions brouillon", value: draftShows, href: "/admin/arena/emissions", hint: "À relire ou publier." },
    { label: "Invités publiés", value: publishedGuests, href: "/admin/arena/guests", hint: "Fiches visibles sur le site." },
    { label: "Vidéos Arena", value: videos, href: "/admin/arena/videos", hint: "Replays et extraits." },
    { label: "Albums photos", value: albums, href: "/admin/arena/albums", hint: "Plateaux et coulisses." },
  ];

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
            Arena Culture
          </h2>
          <p className="mt-1 text-sm text-[#9aa3b5]">
            Espace dédié à l’émission : invités, replays, miniatures et albums.
            {videosWithoutPoster
              ? ` ${videosWithoutPoster} vidéo${videosWithoutPoster > 1 ? "s" : ""} sans miniature.`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/arena/new" className="admin-btn admin-btn-primary text-xs">
            Nouvelle émission
          </Link>
          <Link href="/admin/arena/guests" className="admin-btn admin-btn-ghost text-xs">
            Publier un invité
          </Link>
          <Link href="/admin/arena/videos" className="admin-btn admin-btn-ghost text-xs">
            Ajouter une vidéo
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="admin-card block hover:border-white/20">
            <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">{card.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{card.value}</p>
            <p className="admin-card-hint">{card.hint}</p>
          </Link>
        ))}
      </div>

      <div className="admin-card mt-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
            Dernière émission
          </h3>
          <Link href="/admin/arena/emissions" className="text-xs text-[#9aa3b5] hover:text-white">
            Tout voir
          </Link>
        </div>
        {latestShow ? (
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Link href={`/admin/arena/${latestShow.id}`} className="font-medium hover:underline">
                {latestShow.title}
              </Link>
              <StatusBadge status={latestShow.status} />
            </div>
            <p className="text-sm text-[#9aa3b5]">
              {latestShow.guests[0]?.guest.name || "Sans invité"}
              {latestShow.airDate ? ` · ${formatDate(latestShow.airDate, "d MMM yyyy")}` : ""}
            </p>
            <Link
              href={`/admin/arena/${latestShow.id}`}
              className="admin-btn admin-btn-ghost mt-3 text-xs"
            >
              Éditer
            </Link>
          </div>
        ) : (
          <p className="text-sm text-[#9aa3b5]">Aucune émission pour l’instant.</p>
        )}
      </div>
    </section>
  );
}
