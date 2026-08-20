export type AdminNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  superadmin?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/articles", label: "Articles & chroniques" },
  { href: "/admin/arena", label: "Arena Culture" },
  { href: "/admin/arena/guests", label: "Invités" },
  { href: "/admin/arena/videos", label: "Vidéos Arena" },
  { href: "/admin/arena/seasons", label: "Saisons" },
  { href: "/admin/arena/albums", label: "Albums photos" },
  { href: "/admin/evenements", label: "Événements" },
  { href: "/admin/media", label: "Médias" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/partners", label: "Partenaires" },
  { href: "/admin/artists", label: "Artistes à la une" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/domains", label: "Domaines" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/users", label: "Utilisateurs", superadmin: true },
  { href: "/admin/settings", label: "Paramètres" },
];

export function isAdminNavActive(pathname: string, item: Pick<AdminNavItem, "href" | "exact">) {
  if (item.exact) return pathname === item.href;
  if (item.href === "/admin/arena") {
    return (
      pathname === "/admin/arena" ||
      pathname.startsWith("/admin/arena/new") ||
      pathname.startsWith("/admin/arena/emissions") ||
      pathname.startsWith("/admin/arena/archives") ||
      (/^\/admin\/arena\/[^/]+$/.test(pathname) &&
        !pathname.startsWith("/admin/arena/guests") &&
        !pathname.startsWith("/admin/arena/seasons") &&
        !pathname.startsWith("/admin/arena/albums") &&
        !pathname.startsWith("/admin/arena/videos") &&
        !pathname.startsWith("/admin/arena/emissions") &&
        !pathname.startsWith("/admin/arena/archives"))
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function adminNavTitle(pathname: string, items: AdminNavItem[] = ADMIN_NAV) {
  if (pathname === "/admin") return "Tableau de bord";
  const ranked = items
    .filter((item) => !item.exact && (pathname === item.href || pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length);
  return ranked[0]?.label ?? "Administration";
}
