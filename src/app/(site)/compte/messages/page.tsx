import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { sendSpotlightArtistMessage } from "@/actions/spotlight-messages";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Mes messages" };

export default async function AccountMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/compte/messages");

  const messages = await prisma.spotlightArtistMessage.findMany({
    where: { userId: session.user.id },
    include: { artist: { select: { id: true, name: true, role: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
  const conversations = Array.from(
    messages.reduce((groups, message) => {
      const key = message.artistId;
      const group = groups.get(key) || { artist: message.artist, image: message.image || message.artist.image, messages: [] as typeof messages };
      group.messages.push(message);
      groups.set(key, group);
      return groups;
    }, new Map<string, { artist: typeof messages[number]["artist"]; image: string; messages: typeof messages }>()).values()
  );

  return (
    <section className="account-page min-h-[80vh] px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ember-text">Espace membre</p>
        <h1 className="mt-3 font-display text-4xl uppercase">Mes messages</h1>
        <p className="mt-3 max-w-xl text-paper-muted">Vos partages Spotlight et les réponses privées de l’équipe KISHA BUZZ.</p>

        <div className="mt-8 space-y-6">
          {conversations.map(({ artist, image, messages: thread }) => (
            <article key={artist.id} className="account-card overflow-hidden">
              <header className="flex items-center gap-3 border-b border-line/70 p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <h2 className="font-display text-xl">{artist.name}</h2>
                  <p className="text-xs uppercase tracking-[0.14em] text-ember-text">{artist.role}</p>
                </div>
              </header>
              <div className="space-y-3 p-5">
                {thread.map((message) => (
                  <div key={message.id} className={`private-message ${message.sender === "ADMIN" ? "private-message--admin" : ""}`}>
                    <p className="private-message__sender">{message.sender === "ADMIN" ? message.adminName || "KISHA BUZZ" : "Vous"}</p>
                    <p className="whitespace-pre-wrap">{message.body}</p>
                    <time dateTime={message.createdAt.toISOString()}>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(message.createdAt)}</time>
                  </div>
                ))}
              </div>
              <form action={sendSpotlightArtistMessage} className="border-t border-line/70 p-5">
                <input type="hidden" name="artistId" value={artist.id} />
                <label className="sr-only" htmlFor={`reply-${artist.id}`}>Répondre à l’équipe</label>
                <div className="flex gap-2">
                  <textarea id={`reply-${artist.id}`} name="body" required minLength={2} maxLength={1000} rows={2} placeholder="Répondre à l’équipe…" className="min-w-0 flex-1 rounded-xl border border-line bg-ink-2 px-3 py-2 text-sm" />
                  <button type="submit" className="btn-primary self-end">Envoyer</button>
                </div>
              </form>
            </article>
          ))}
          {!conversations.length ? (
            <div className="account-card p-8 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-ember-text" aria-hidden />
              <p className="mt-3 font-semibold">Aucun message pour le moment.</p>
              <p className="mt-1 text-sm text-paper-muted">Partagez l’image d’un artiste Spotlight depuis l’accueil pour écrire à l’équipe.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
