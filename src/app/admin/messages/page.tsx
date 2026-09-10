import { sendAdminSpotlightReply } from "@/actions/spotlight-messages";
import { AdminPageIntro } from "@/components/admin/AdminHint";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Messagerie privée" };

export default async function AdminMessagesPage() {
  await requireAdmin();
  const messages = await prisma.spotlightArtistMessage.findMany({
    include: {
      artist: { select: { id: true, name: true, image: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const conversations = Array.from(
    messages.reduce((groups, message) => {
      const key = `${message.userId}:${message.artistId}`;
      const group = groups.get(key) || { artist: message.artist, user: message.user, image: message.image || message.artist.image, messages: [] as typeof messages };
      group.messages.push(message);
      groups.set(key, group);
      return groups;
    }, new Map<string, { artist: typeof messages[number]["artist"]; user: typeof messages[number]["user"]; image: string; messages: typeof messages }>()).values()
  ).reverse();

  return (
    <div>
      <AdminPageIntro title="Messagerie privée" hint="Messages envoyés avec les images des artistes Spotlight. Ces échanges ne sont jamais publiés sur le site." />
      <div className="mt-6 space-y-5">
        {conversations.map(({ artist, user, image, messages: thread }) => (
          <article key={`${user.id}-${artist.id}`} className="admin-card">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <h2 className="font-semibold">{artist.name}</h2>
                  <p className="text-sm text-[#aeb6c5]">{user.name || "Membre"} · {user.email}</p>
                </div>
              </div>
              <span className="text-xs text-[#9aa3b5]">{thread.length} message{thread.length > 1 ? "s" : ""}</span>
            </header>
            <div className="mt-4 space-y-3">
              {thread.map((message) => (
                <div key={message.id} className={`admin-private-message ${message.sender === "ADMIN" ? "admin-private-message--admin" : ""}`}>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-300">{message.sender === "ADMIN" ? message.adminName || "KISHA BUZZ" : user.name || "Membre"}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                  <time className="mt-2 block text-xs text-[#9aa3b5]" dateTime={message.createdAt.toISOString()}>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(message.createdAt)}</time>
                </div>
              ))}
            </div>
            <form action={sendAdminSpotlightReply} className="mt-4 flex gap-2 border-t border-white/10 pt-4">
              <input type="hidden" name="artistId" value={artist.id} />
              <input type="hidden" name="userId" value={user.id} />
              <textarea name="body" required minLength={2} maxLength={1000} rows={2} placeholder={`Répondre à ${user.name || "ce membre"}…`} className="admin-input min-w-0 flex-1" />
              <button type="submit" className="admin-btn admin-btn-primary self-end">Répondre</button>
            </form>
          </article>
        ))}
        {!conversations.length ? <p className="text-sm text-[#9aa3b5]">Aucun message Spotlight pour le moment.</p> : null}
      </div>
    </div>
  );
}
