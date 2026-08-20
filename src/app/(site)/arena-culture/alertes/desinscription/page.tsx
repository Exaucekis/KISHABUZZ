import type { Metadata } from "next";
import { ArenaAlertUnsubscribeForm } from "@/components/arena/ArenaAlertUnsubscribeForm";
import { ArenaPageIntro } from "@/components/arena/ArenaPageIntro";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Désinscription alertes Arena",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ArenaAlertUnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;
  const row = token
    ? await prisma.arenaAlertSubscriber.findUnique({ where: { unsubscribeToken: token } })
    : null;

  return (
    <>
      <ArenaPageIntro title="Désinscription" description="Alertes Arena Culture — email et WhatsApp." />
      <section className="ac-page">
        {!token || !row ? (
          <p>Ce lien de désinscription n’est pas valide.</p>
        ) : (
          <ArenaAlertUnsubscribeForm token={token} />
        )}
      </section>
    </>
  );
}
