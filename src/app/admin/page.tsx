import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/roles";

export const metadata = { title: "Tableau de bord" };

export default async function AdminDashboardPage() {
  const session = await auth();
  const [
    articles,
    chroniques,
    publications,
    emissions,
    photos,
    videos,
    partners,
    contactsNew,
    users,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { contentType: "CHRONIQUE" } }),
    prisma.article.count({ where: { contentType: "ARTICLE" } }),
    prisma.arenaShow.count(),
    prisma.mediaAsset.count({ where: { kind: "IMAGE" } }),
    prisma.mediaAsset.count({ where: { kind: "VIDEO" } }),
    prisma.partner.count(),
    prisma.contactRequest.count({ where: { status: "NEW" } }),
    prisma.user.count(),
  ]);

  const cards = [
    { label: "Articles (total)", value: articles, href: "/admin/articles" },
    { label: "Chroniques", value: chroniques, href: "/admin/articles?type=CHRONIQUE" },
    { label: "Publications", value: publications, href: "/admin/articles?type=ARTICLE" },
    { label: "Émissions Arena", value: emissions, href: "/admin/arena" },
    { label: "Photos", value: photos, href: "/admin/media?kind=IMAGE" },
    { label: "Vidéos", value: videos, href: "/admin/media?kind=VIDEO" },
    { label: "Partenaires", value: partners, href: "/admin/partners" },
    { label: "Contacts nouveaux", value: contactsNew, href: "/admin/contacts?status=NEW" },
    ...(session?.user?.role === "SUPERADMIN"
      ? [{ label: "Utilisateurs", value: users, href: "/admin/users" }]
      : []),
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Tableau de bord</h1>
      <p className="mt-1 text-sm text-[#9aa3b5]">
        Connecté en tant que {session?.user?.name || session?.user?.email} · {roleLabel(session?.user?.role)}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="admin-card block hover:border-white/20">
            <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
