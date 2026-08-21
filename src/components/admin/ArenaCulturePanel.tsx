import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";

type LiveShow = {
  id: string;
  title: string;
  status: string;
  guestName: string | null;
};

export function ArenaCulturePanel({
  headline,
  announced,
}: {
  headline: (LiveShow & { hasVideo: boolean }) | null;
  announced: (LiveShow & { poster: string }) | null;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <article className="admin-card">
        <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">Émission en cours</p>
        {headline ? (
          <>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{headline.guestName || headline.title}</h3>
              <StatusBadge status={headline.status} />
            </div>
            <p className="mt-1 text-sm text-[#9aa3b5]">
              {headline.hasVideo ? "Vidéo en ligne sur Émissions." : "Publiée, encore sans vidéo."}
            </p>
            <Link href={`/admin/arena/${headline.id}`} className="admin-btn admin-btn-ghost mt-3 text-xs">
              Modifier
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-[#eef1f6]">Aucune émission en vidéo pour l’instant.</p>
            <Link href="/admin/arena/emissions" className="admin-btn admin-btn-primary mt-3 text-xs">
              Publier une émission
            </Link>
          </>
        )}
      </article>

      <article className="admin-card">
        <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">Prochain invité</p>
        {announced ? (
          <div className="mt-2 flex gap-3">
            {announced.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={announced.poster} alt="" className="h-16 w-12 shrink-0 rounded object-cover" />
            ) : null}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">{announced.guestName || announced.title}</h3>
                <StatusBadge status={announced.status} />
              </div>
              <Link
                href="/admin/arena/prochain-invite"
                className="admin-btn admin-btn-ghost mt-3 text-xs"
              >
                Changer l’affiche
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-[#eef1f6]">Pas encore d’affiche annoncée.</p>
            <Link href="/admin/arena/prochain-invite" className="admin-btn admin-btn-primary mt-3 text-xs">
              Annoncer le prochain invité
            </Link>
          </>
        )}
      </article>
    </div>
  );
}
