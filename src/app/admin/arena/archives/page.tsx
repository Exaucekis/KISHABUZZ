import Link from "next/link";
import { deleteArenaShow } from "@/actions/admin/arena";
import { deleteMedia } from "@/actions/admin/media";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminConfirmForm } from "@/components/admin/AdminConfirmForm";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { archiveLabel } from "@/lib/arena-archive";
import { videoPoster } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Archives Arena" };

export default async function AdminArenaArchivesPage() {
  const [shows, videos, visualAssets] = await Promise.all([
    prisma.arenaShow.findMany({
      where: { status: "ARCHIVED" },
      include: {
        season: true,
        guests: { include: { guest: { select: { name: true } } } },
      },
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

  const visualUrls = new Set(visualAssets.map((item) => item.url));
  const posterVisuals = shows
    .filter((show) => show.poster && !visualUrls.has(show.poster))
    .map((show) => ({
      id: `show-poster:${show.id}`,
      showId: show.id,
      title: show.title,
      url: show.poster,
      thumbnail: show.poster,
      date: show.airDate,
    }));
  const visuals = [
    ...visualAssets.map((item) => ({
      id: item.id,
      showId: null as string | null,
      title: archiveLabel(item.title),
      url: item.url,
      thumbnail: item.thumbnail || item.url,
      date: item.date,
    })),
    ...posterVisuals,
  ];

  return (
    <div>
      <AdminPageIntro
        title="Archives Arena"
        hint="Tout ce qui quitte l’accueil arrive ici. Modifier un contenu en ligne archive l’ancienne pièce. Supprimer ici le retire définitivement : le public constate seulement qu’il n’est plus dans ses archives."
        actions={
          <Link href="/arena-culture/archives" className="admin-btn admin-btn-ghost" target="_blank" rel="noreferrer">
            Voir les archives
          </Link>
        }
      />
      <ArenaAdminNav current="/admin/arena/archives" />

      <nav className="admin-archive-nav" aria-label="Tiroirs d’archives">
        <a href="#archives-emissions">Émissions · {shows.length}</a>
        <a href="#archives-videos">Vidéos · {videos.length}</a>
        <a href="#archives-visuels">Affiches & visuels · {visuals.length}</a>
      </nav>

      <section id="archives-emissions" className="admin-archive-section">
        <div className="admin-archive-head">
          <div>
            <p className="admin-archive-kicker">01 · Émissions</p>
            <h2>Épisodes archivés</h2>
            <p>Rediffusions retirées de la une. Le public les voit encore, jusqu’à suppression ici.</p>
          </div>
          <Link href="/admin/arena/emissions" className="admin-btn admin-btn-ghost text-xs">
            Toutes les émissions
          </Link>
        </div>
        {shows.length ? (
          <div className="admin-archive-grid admin-archive-grid--shows">
            {shows.map((show) => {
              const guest = show.guests[0]?.guest?.name;
              const cover = show.poster || show.videoThumbnail;
              return (
                <article key={show.id} className="admin-archive-card">
                  <div className="admin-archive-card__media">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" />
                    ) : (
                      <div className="admin-archive-card__placeholder">Sans visuel</div>
                    )}
                    {show.videoUrl ? <span className="admin-archive-badge">Vidéo</span> : null}
                  </div>
                  <div className="admin-archive-card__body">
                    <p className="admin-archive-meta">
                      Ép. {String(show.number).padStart(2, "0")}
                      {show.season ? ` · S${show.season.number}` : ""}
                      {show.airDate ? ` · ${formatDate(show.airDate, "d MMM yyyy")}` : ""}
                    </p>
                    <h3>{show.title}</h3>
                    {guest ? <p className="admin-archive-guest">{guest}</p> : null}
                    <div className="admin-archive-actions">
                      <Link href={`/admin/arena/${show.id}`} className="admin-btn admin-btn-ghost text-xs">
                        Modifier
                      </Link>
                      <AdminConfirmForm
                        action={deleteArenaShow}
                        label="Supprimer"
                        title="Retirer définitivement des archives ?"
                        description="Le public ne verra plus cet épisode. Cette action est irréversible."
                        confirmLabel="Oui, retirer"
                      >
                        <input type="hidden" name="id" value={show.id} />
                        <input type="hidden" name="next" value="/admin/arena/archives" />
                      </AdminConfirmForm>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="admin-card text-sm text-[#9aa3b5]">Aucune émission archivée pour l’instant.</p>
        )}
      </section>

      <section id="archives-videos" className="admin-archive-section">
        <div className="admin-archive-head">
          <div>
            <p className="admin-archive-kicker">02 · Vidéos</p>
            <h2>Vidéos archivées</h2>
            <p>Anciennes émissions et extraits. Les supprimer ici les fait disparaître du site public.</p>
          </div>
          <Link href="/admin/arena/videos" className="admin-btn admin-btn-ghost text-xs">
            Gérer les vidéos
          </Link>
        </div>
        {videos.length ? (
          <div className="admin-archive-grid admin-archive-grid--videos">
            {videos.map((video) => {
              const poster = videoPoster(video.url, video.thumbnail);
              return (
                <article key={video.id} className="admin-archive-card">
                  <div className="admin-archive-card__media admin-archive-card__media--wide">
                    {poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={poster} alt="" />
                    ) : (
                      <div className="admin-archive-card__placeholder">Sans miniature</div>
                    )}
                    <span className="admin-archive-badge">Vidéo</span>
                  </div>
                  <div className="admin-archive-card__body">
                    <p className="admin-archive-meta">
                      {video.arenaShow ? `Émission · ${video.arenaShow.title}` : "Vidéo seule"}
                      {video.date ? ` · ${formatDate(video.date, "d MMM yyyy")}` : ""}
                    </p>
                    <h3>{archiveLabel(video.title)}</h3>
                    <div className="admin-archive-actions">
                      <Link
                        href={video.arenaShow ? `/admin/arena/${video.arenaShow.id}` : "/admin/arena/videos"}
                        className="admin-btn admin-btn-ghost text-xs"
                      >
                        Modifier
                      </Link>
                      <AdminConfirmForm
                        action={deleteMedia}
                        label="Supprimer"
                        title="Retirer définitivement des archives ?"
                        description="Le public ne verra plus cette vidéo. Cette action est irréversible."
                        confirmLabel="Oui, retirer"
                      >
                        <input type="hidden" name="id" value={video.id} />
                        <input type="hidden" name="next" value="/admin/arena/archives" />
                      </AdminConfirmForm>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="admin-card text-sm text-[#9aa3b5]">Aucune vidéo archivée pour l’instant.</p>
        )}
      </section>

      <section id="archives-visuels" className="admin-archive-section">
        <div className="admin-archive-head">
          <div>
            <p className="admin-archive-kicker">03 · Affiches & visuels</p>
            <h2>Visuels remplacés</h2>
            <p>Affiches de prochain invité et images de page. Un retrait ici les cache au public.</p>
          </div>
        </div>
        {visuals.length ? (
          <div className="admin-archive-grid admin-archive-grid--posters">
            {visuals.map((item) => {
              const mediaId = item.id.startsWith("show-poster:") ? null : item.id;
              return (
                <article key={item.id} className="admin-archive-card">
                  <div className="admin-archive-card__media admin-archive-card__media--poster">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumbnail || item.url} alt="" />
                  </div>
                  <div className="admin-archive-card__body">
                    <p className="admin-archive-meta">
                      {item.date ? formatDate(item.date, "d MMM yyyy") : "Affiche"}
                    </p>
                    <h3>{item.title}</h3>
                    <div className="admin-archive-actions">
                      {item.showId || mediaId ? (
                        <Link
                          href={item.showId ? `/admin/arena/${item.showId}` : "/admin/arena"}
                          className="admin-btn admin-btn-ghost text-xs"
                        >
                          Modifier
                        </Link>
                      ) : null}
                      {mediaId ? (
                        <AdminConfirmForm
                          action={deleteMedia}
                          label="Supprimer"
                          title="Retirer définitivement des archives ?"
                          description="Le public ne verra plus ce visuel. Cette action est irréversible."
                          confirmLabel="Oui, retirer"
                        >
                          <input type="hidden" name="id" value={mediaId} />
                          <input type="hidden" name="next" value="/admin/arena/archives" />
                        </AdminConfirmForm>
                      ) : item.showId ? (
                        <AdminConfirmForm
                          action={deleteArenaShow}
                          label="Supprimer"
                          title="Retirer l’émission et son affiche ?"
                          description="Cette affiche est liée à un épisode archivé. Le public ne le verra plus."
                          confirmLabel="Oui, retirer"
                        >
                          <input type="hidden" name="id" value={item.showId} />
                          <input type="hidden" name="next" value="/admin/arena/archives" />
                        </AdminConfirmForm>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="admin-card text-sm text-[#9aa3b5]">Aucun visuel archivé pour l’instant.</p>
        )}
      </section>
    </div>
  );
}
