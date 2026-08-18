import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ScanGate } from "@/components/events/ScanGate";
import { EmptyState } from "@/components/ui/EmptyState";
import { auth } from "@/lib/auth";
import { canAccessScan, listScannableEvents, scanResultLabel } from "@/lib/ticket-scan";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contrôle d’entrée",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ event?: string }> };

export default async function ScanPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/scan");
  if (!(await canAccessScan(session.user.id, session.user.role))) {
    redirect("/compte");
  }

  const { event: eventQuery } = await searchParams;
  const events = await listScannableEvents(session.user.id, session.user.role);
  const initialEventId = events.some((event) => event.id === eventQuery) ? eventQuery : events[0]?.id;
  const recent = initialEventId
    ? await prisma.ticketScan.findMany({
        where: { eventId: initialEventId },
        include: { ticket: { select: { publicCode: true, holderName: true } } },
        orderBy: { scannedAt: "desc" },
        take: 8,
      })
    : [];

  return (
    <section className="mx-auto max-w-lg px-4 py-28 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Entrée</p>
      <h1 className="mt-3 font-display text-4xl uppercase">Scan des billets</h1>
      <p className="mt-4 text-sm text-paper-muted">
        Choisissez l’événement, puis scannez. Le serveur décide : un QR copié ou déjà utilisé est refusé.
      </p>
      <span className="section-line mt-6" aria-hidden />

      {!events.length ? (
        <div className="mt-10">
          <EmptyState
            title="Aucun événement à contrôler"
            description="Un administrateur doit vous ajouter comme staff sur un événement publié."
            action={
              <Link href="/compte" className="text-sm font-semibold text-ember-text">
                Retour au compte
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8">
          <ScanGate
            events={events.map((event) => ({
              id: event.id,
              title: event.title,
              startsAt: event.startsAt.toISOString(),
            }))}
            initialEventId={initialEventId}
          />
          {recent.length ? (
            <div className="mt-10">
              <h2 className="font-display text-xl">Derniers scans</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {recent.map((scan) => (
                  <li key={scan.id} className="flex justify-between gap-3 border-b border-line py-2">
                    <span>
                      {scan.ticket.publicCode}
                      <span className="mt-0.5 block text-xs text-paper-muted">{scan.ticket.holderName}</span>
                    </span>
                    <span className="text-right text-paper-muted">
                      {scanResultLabel(scan.result)}
                      <span className="mt-0.5 block text-xs">{formatDate(scan.scannedAt, "HH:mm:ss")}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
