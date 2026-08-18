import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/newsletter/UnsubscribeForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Désinscription newsletter",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function NewsletterUnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;
  const row = token
    ? await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } })
    : null;

  return (
    <>
      <section className="border-b border-line bg-ink-2 pt-28 pb-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h1 className="font-display text-4xl md:text-5xl">Newsletter</h1>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {!token || !row ? (
          <p className="text-paper-muted">Ce lien de désinscription n’est pas valide.</p>
        ) : row.status === "UNSUBSCRIBED" ? (
          <p className="text-paper">Vous êtes déjà désinscrit.</p>
        ) : (
          <UnsubscribeForm token={token} />
        )}
      </div>
    </>
  );
}
