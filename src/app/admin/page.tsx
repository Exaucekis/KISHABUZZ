import Link from "next/link";
import { ArenaCulturePanel } from "@/components/admin/ArenaCulturePanel";
import { EditorialDashboard } from "@/components/admin/EditorialDashboard";
import { AdminAction, AdminActionRow, AdminPageIntro } from "@/components/admin/AdminHint";
import { AdminHomeTabs } from "@/components/admin/AdminHomeTabs";
import { auth } from "@/lib/auth";
import { editorialHeadline } from "@/lib/editorial-dashboard";
import { videoPoster } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/roles";

export const metadata = { title: "Tableau de bord" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await auth();
  const [
    draftsCount,
    scheduledCount,
    publishedCount,
    contactsNew,
    arenaDrafts,
    drafts,
    scheduled,
    contacts,
    latestShow,
    chroniques,
    photos,
    videos,
    partners,
    artists,
    subscribers,
    users,
    publishedShows,
    publishedGuests,
    arenaVideos,
    arenaAlbums,
    arenaVideoRows,
    publishedEvents,
  ] = await Promise.all([
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "SCHEDULED" } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.contactRequest.count({ where: { status: "NEW" } }),
    prisma.arenaShow.count({ where: { status: "DRAFT" } }),
    prisma.article.findMany({
      where: { status: "DRAFT" },
      select: { id: true, title: true, slug: true, contentType: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.article.findMany({
      where: { status: "SCHEDULED" },
      select: {
        id: true,
        title: true,
        slug: true,
        contentType: true,
        updatedAt: true,
        scheduledAt: true,
      },
      orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }],
      take: 5,
    }),
    prisma.contactRequest.findMany({
      where: { status: "NEW" },
      select: { id: true, name: true, subject: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.arenaShow.findFirst({
      orderBy: [{ airDate: "desc" }, { number: "desc" }],
      select: {
        id: true,
        title: true,
        status: true,
        airDate: true,
        guests: { take: 1, select: { guest: { select: { name: true } } } },
      },
    }),
    prisma.article.count({ where: { contentType: "CHRONIQUE" } }),
    prisma.mediaAsset.count({ where: { kind: "IMAGE" } }),
    prisma.mediaAsset.count({ where: { kind: "VIDEO" } }),
    prisma.partner.count(),
    prisma.spotlightArtist.count(),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.arenaShow.count({ where: { status: "PUBLISHED" } }),
    prisma.arenaGuest.count({ where: { visible: true } }),
    prisma.mediaAsset.count({
      where: { kind: "VIDEO", OR: [{ category: "ARENA_CULTURE" }, { arenaShowId: { not: null } }] },
    }),
    prisma.photoAlbum.count({ where: { visible: true } }),
    prisma.mediaAsset.findMany({
      where: { kind: "VIDEO", OR: [{ category: "ARENA_CULTURE" }, { arenaShowId: { not: null } }] },
      select: { url: true, thumbnail: true },
    }),
    prisma.event.count({ where: { status: { in: ["PUBLISHED", "SOLD_OUT"] } } }),
  ]);

  const headline = editorialHeadline({
    drafts: draftsCount,
    scheduled: scheduledCount,
    contactsNew,
    arenaDrafts,
  });

  const workCards = [
    { label: "Brouillons", value: draftsCount, href: "/admin/articles?status=DRAFT", hint: "Textes à finir ou relire." },
    { label: "Programmés", value: scheduledCount, href: "/admin/articles?status=SCHEDULED", hint: "Mise en ligne automatique." },
    { label: "Contacts nouveaux", value: contactsNew, href: "/admin/contacts?status=NEW", hint: "Messages à traiter." },
    { label: "Émissions brouillon", value: arenaDrafts, href: "/admin/arena/emissions", hint: "Épisodes Arena non publiés." },
  ];

  const siteCards = [
    { label: "Publiés", value: publishedCount, href: "/admin/articles", hint: "En ligne sur le site." },
    { label: "Chroniques", value: chroniques, href: "/admin/articles?type=CHRONIQUE", hint: "Textes d’opinion." },
    { label: "Photos", value: photos, href: "/admin/media?kind=IMAGE", hint: "Galerie média." },
    { label: "Vidéos", value: videos, href: "/admin/arena/videos", hint: "Vidéos Arena et extraits." },
    { label: "Événements", value: publishedEvents, href: "/admin/evenements", hint: "Billetterie en ligne." },
    { label: "Partenaires", value: partners, href: "/admin/partners", hint: "Collaborations." },
    { label: "Artistes à la une", value: artists, href: "/admin/artists", hint: "Bandeau d’accueil." },
    { label: "Newsletter", value: subscribers, href: "/admin/newsletter", hint: "Abonnés actifs." },
    ...(session?.user?.role === "SUPERADMIN"
      ? [{ label: "Utilisateurs", value: users, href: "/admin/users", hint: "Comptes et rôles." }]
      : []),
  ];

  return (
    <div>
      <AdminPageIntro
        title="Tableau de bord"
        hint={`${headline} Choisissez un onglet : chaque rubrique a uniquement ses boutons. Connecté en tant que ${session?.user?.name || session?.user?.email} · ${roleLabel(session?.user?.role)}.`}
      />

      <AdminHomeTabs
        editorial={
          <section className="admin-dash-panel">
            <div className="admin-dash-panel__head">
              <div>
                <h2 className="admin-dash-panel__title">À traiter</h2>
                <p className="admin-dash-panel__hint">
                  File éditoriale : brouillons, publications programmées et messages reçus.
                </p>
              </div>
              <AdminActionRow>
                <AdminAction
                  href="/admin/articles/new"
                  label="Nouvel article"
                  hint="Chronique ou publication"
                  variant="primary"
                />
                <AdminAction
                  href="/admin/contacts?status=NEW"
                  label="Ouvrir les contacts"
                  hint="Répondre aux messages"
                />
              </AdminActionRow>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {workCards.map((card) => (
                <Link key={card.label} href={card.href} className="admin-card block hover:border-white/20">
                  <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums">{card.value}</p>
                  <p className="admin-card-hint">{card.hint}</p>
                </Link>
              ))}
            </div>
            <EditorialDashboard drafts={drafts} scheduled={scheduled} contacts={contacts} />
          </section>
        }
        arena={
          <section className="admin-dash-panel">
            <AdminActionRow>
              <AdminAction
                href="/admin/arena/new"
                label="Nouvelle émission"
                hint="Créer un épisode Arena"
                variant="primary"
              />
              <AdminAction
                href="/admin/arena/guests"
                label="Publier un invité"
                hint="Portrait visible sur le site"
              />
              <AdminAction
                href="/admin/arena/videos"
                label="Ajouter une vidéo"
                hint="Replay ou extrait"
              />
              <AdminAction
                href="/admin/arena"
                label="Page Arena"
                hint="Textes et visuels d’accueil"
              />
            </AdminActionRow>
            <ArenaCulturePanel
              publishedShows={publishedShows}
              draftShows={arenaDrafts}
              publishedGuests={publishedGuests}
              videos={arenaVideos}
              albums={arenaAlbums}
              videosWithoutPoster={arenaVideoRows.filter((row) => !videoPoster(row.url, row.thumbnail)).length}
              latestShow={latestShow}
            />
          </section>
        }
        site={
          <section className="admin-dash-panel">
            <div className="admin-dash-panel__head">
              <div>
                <h2 className="admin-dash-panel__title">Accueil & site</h2>
                <p className="admin-dash-panel__hint">
                  Ce qui s’affiche sur la page principale : hero, artistes, partenaires, événements.
                </p>
              </div>
              <AdminActionRow>
                <AdminAction
                  href="/admin/settings"
                  label="Paramètres"
                  hint="Nom, accroche, visuel d’accueil"
                  variant="primary"
                />
                <AdminAction
                  href="/admin/artists"
                  label="Artistes à la une"
                  hint="Bandeau Spotlight de l’accueil"
                />
                <AdminAction
                  href="/admin/evenements/new"
                  label="Nouvel événement"
                  hint="Billetterie en ligne"
                />
              </AdminActionRow>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {siteCards.map((card) => (
                <Link key={card.label} href={card.href} className="admin-card block hover:border-white/20">
                  <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums">{card.value}</p>
                  <p className="admin-card-hint">{card.hint}</p>
                </Link>
              ))}
            </div>
          </section>
        }
      />
    </div>
  );
}
