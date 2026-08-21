import { ArenaCulturePanel } from "@/components/admin/ArenaCulturePanel";
import { EditorialDashboard } from "@/components/admin/EditorialDashboard";
import { AdminAction, AdminActionRow, AdminPageIntro } from "@/components/admin/AdminHint";
import { auth } from "@/lib/auth";
import { editorialHeadline } from "@/lib/editorial-dashboard";
import { arenaSpotlightGuest } from "@/lib/arena-spotlight";
import { getArenaStage } from "@/lib/data";
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
    contactsNew,
    arenaDrafts,
    drafts,
    scheduled,
    contacts,
    liveEvents,
    stage,
  ] = await Promise.all([
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "SCHEDULED" } }),
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
    prisma.event.findMany({
      where: { status: { in: ["PUBLISHED", "SOLD_OUT"] } },
      select: { id: true, title: true, startsAt: true, status: true, city: true, venueName: true },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
    getArenaStage(),
  ]);

  const headline = editorialHeadline({
    drafts: draftsCount,
    scheduled: scheduledCount,
    contactsNew,
    arenaDrafts,
  });

  return (
    <div className="space-y-10">
      <AdminPageIntro
        title="Tableau de bord"
        hint={`${headline} ${session?.user?.name || session?.user?.email} · ${roleLabel(session?.user?.role)}.`}
      />

      <section className="admin-dash-panel">
        <div className="admin-dash-panel__head">
          <div>
            <h2 className="admin-dash-panel__title">À faire</h2>
            <p className="admin-dash-panel__hint">
              Ce que vous touchez souvent : textes en attente, messages, billetterie en cours.
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
              href="/admin/evenements/new"
              label="Nouvel événement"
              hint="Ouvrir une vente"
            />
            <AdminAction
              href="/admin/contacts?status=NEW"
              label="Messages"
              hint="Répondre aux contacts"
            />
          </AdminActionRow>
        </div>
        <EditorialDashboard
          drafts={drafts}
          scheduled={scheduled}
          contacts={contacts}
          events={liveEvents}
        />
      </section>

      <section className="admin-dash-panel">
        <div className="admin-dash-panel__head">
          <div>
            <h2 className="admin-dash-panel__title">Arena maintenant</h2>
            <p className="admin-dash-panel__hint">
              À chaque épisode : la vidéo en cours et l’affiche du prochain invité.
            </p>
          </div>
          <AdminActionRow>
            <AdminAction
              href="/admin/arena/emissions"
              label="Émissions"
              hint="Vidéo, invité, domaine"
              variant="primary"
            />
            <AdminAction
              href="/admin/arena/prochain-invite"
              label="Prochain invité"
              hint="Changer l’affiche"
            />
            <AdminAction href="/admin/arena/albums" label="Photos" hint="Album de l’invité" />
          </AdminActionRow>
        </div>
        <ArenaCulturePanel
          headline={
            stage.headline
              ? {
                  id: stage.headline.id,
                  title: stage.headline.title,
                  status: stage.headline.status,
                  guestName: arenaSpotlightGuest(stage.headline)?.name || null,
                  hasVideo: Boolean(String(stage.headline.videoUrl || "").trim()),
                }
              : null
          }
          announced={
            stage.announced
              ? {
                  id: stage.announced.id,
                  title: stage.announced.title,
                  status: stage.announced.status,
                  guestName: arenaSpotlightGuest(stage.announced)?.name || null,
                  poster: stage.announced.poster,
                }
              : null
          }
        />
      </section>
    </div>
  );
}
