import Link from "next/link";
import { EditorialDashboard } from "@/components/admin/EditorialDashboard";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { auth } from "@/lib/auth";
import { editorialHeadline } from "@/lib/editorial-dashboard";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/roles";

export const metadata = { title: "Tableau de bord" };

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
    { label: "Émissions brouillon", value: arenaDrafts, href: "/admin/arena", hint: "Épisodes Arena non publiés." },
  ];

  const siteCards = [
    { label: "Publiés", value: publishedCount, href: "/admin/articles", hint: "En ligne sur le site." },
    { label: "Chroniques", value: chroniques, href: "/admin/articles?type=CHRONIQUE", hint: "Textes d’opinion." },
    { label: "Photos", value: photos, href: "/admin/media?kind=IMAGE", hint: "Galerie média." },
    { label: "Vidéos", value: videos, href: "/admin/media?kind=VIDEO", hint: "Vidéos Arena et extraits." },
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
        hint={`${headline} Connecté en tant que ${session?.user?.name || session?.user?.email} · ${roleLabel(session?.user?.role)}.`}
        actions={
          <>
            <Link href="/admin/articles/new" className="admin-btn admin-btn-primary">
              Nouvel article
            </Link>
            <Link href="/admin/arena/new" className="admin-btn admin-btn-ghost">
              Nouvelle émission
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {workCards.map((card) => (
          <Link key={card.label} href={card.href} className="admin-card block hover:border-white/20">
            <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{card.value}</p>
            <p className="admin-card-hint">{card.hint}</p>
          </Link>
        ))}
      </div>

      <EditorialDashboard
        drafts={drafts}
        scheduled={scheduled}
        contacts={contacts}
        latestShow={latestShow}
      />

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-[#9aa3b5]">
        Le site
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {siteCards.map((card) => (
          <Link key={card.label} href={card.href} className="admin-card block hover:border-white/20">
            <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">{card.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{card.value}</p>
            <p className="admin-card-hint">{card.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
