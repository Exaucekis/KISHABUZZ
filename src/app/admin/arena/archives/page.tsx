import Link from "next/link";
import { ArenaAdminNav } from "@/components/admin/ArenaAdminNav";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { ArenaShowsTable } from "@/components/admin/ArenaShowsTable";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Archives Arena" };

export default async function AdminArenaArchivesPage() {
  const shows = await prisma.arenaShow.findMany({
    where: { status: "ARCHIVED" },
    include: { season: true },
    orderBy: [{ airDate: "desc" }, { number: "desc" }],
  });

  return (
    <div>
      <AdminPageIntro
        title="Archives Arena"
        hint="Saisons et épisodes déjà diffusés. Ils restent visibles en rediffusion sur le site."
        actions={
          <Link href="/arena-culture/archives" className="admin-btn admin-btn-ghost" target="_blank" rel="noreferrer">
            Voir les archives
          </Link>
        }
      />
      <ArenaAdminNav current="/admin/arena/archives" />
      <ArenaShowsTable shows={shows} />
    </div>
  );
}
