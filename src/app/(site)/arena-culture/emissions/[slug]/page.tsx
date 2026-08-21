import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareButtons } from "@/components/content/ShareButtons";
import { PageViews } from "@/components/content/PageViews";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { getShowBySlug } from "@/lib/data";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { arenaShowVideo, videoPoster } from "@/lib/media";
import { arenaShowPlace, arenaTicketCta } from "@/lib/arena-calendar";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const show = await getShowBySlug(slug);
  if (!show) return { title: "Émission" };
  const guest = arenaSpotlightGuest(show);
  return {
    title: `${guest?.name || show.title} · Arena Culture`,
    description: show.theme || guest?.profession || show.description || `Émission ${show.number} — Arena Culture`,
  };
}

export default async function ArenaEmissionDetailPage({ params }: Props) {
  const { slug } = await params;
  const show = await getShowBySlug(slug);
  if (!show) notFound();

  const guests = show.guests.map((g) => g.guest).filter((g) => g.visible !== false);
  const lead = arenaSpotlightGuest(show);
  const video = arenaShowVideo(show);
  const extraVideos = show.media.filter((m) => m.kind === "VIDEO" && m.url !== video);
  const place = arenaShowPlace(show, show.event);
  const ticket = arenaTicketCta(show.event);

  return (
    <article>
      <header className="ac-intro" style={{ maxWidth: "48rem" }}>
        <p className="ac-kicker">
          {show.status === "SCHEDULED"
            ? "Prochain invité"
            : show.status === "PUBLISHED"
              ? "Nouvelle émission"
              : "Rediffusion · Archives"}
          {` · Épisode ${String(show.number).padStart(2, "0")}`}
          {show.season ? ` · Saison ${show.season.number} (${show.season.year})` : ""}
        </p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] md:text-5xl lg:text-6xl">
          {lead?.name || show.title}
        </h1>
        {show.theme || lead?.profession ? (
          <p className="mt-4 text-lg text-paper-muted md:text-xl">
            {show.theme || lead?.profession}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-paper-muted">
          {show.airDate ? (
            <span>
              {formatDate(show.airDate)}
              {show.airTime ? ` · ${show.airTime}` : ""}
            </span>
          ) : null}
          {place ? <span>{place}</span> : null}
          <PageViews kind="show" id={show.id} initial={show.views} />
        </div>
        {ticket ? (
          <div className="ac-cal-card__actions">
            <Link
              href={ticket.href}
              className={`ac-btn ${ticket.kind === "soldout" ? "ac-btn--ghost" : "ac-btn--primary"}`}
            >
              {ticket.label}
            </Link>
            <Link href="/arena-culture/calendrier" className="ac-btn ac-btn--ghost">
              Toutes les dates
            </Link>
          </div>
        ) : null}
      </header>

      {video ? (
        <div className="mx-auto max-w-4xl px-4 pt-8 md:px-6">
          <VideoEmbed
            url={video}
            title={show.title}
            poster={videoPoster(video, show.videoThumbnail)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {show.description ? (
          <p className="font-serif text-lg leading-relaxed text-paper-muted whitespace-pre-line">
            {show.description}
          </p>
        ) : null}

        {guests.length ? (
          <div className="mt-12">
            <h2 className="font-display text-2xl">Invité</h2>
            <ul className="mt-6 space-y-3">
              {guests.map((g) => (
                <li key={g.id}>
                  <p className="font-display text-xl">{g.name}</p>
                  {g.profession ? (
                    <p className="mt-1 text-sm text-paper-muted">{g.profession}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {extraVideos.length ? (
          <div className="mt-12 space-y-6">
            <h2 className="font-display text-2xl">Autres vidéos</h2>
            {extraVideos.map((v) => (
              <div key={v.id}>
                <VideoEmbed url={v.url} title={v.title} poster={videoPoster(v.url, v.thumbnail)} />
                <p className="mt-2 text-sm text-paper-muted">{v.title}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-12 border-t border-line pt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-paper-muted">Partager</p>
          <ShareButtons title={show.title} path={`/arena-culture/emissions/${show.slug}`} />
        </div>

        <p className="mt-10">
          <Link href="/arena-culture/emissions" className="text-sm text-arena-accent">
            ← Toutes les émissions
          </Link>
        </p>
      </div>
    </article>
  );
}
