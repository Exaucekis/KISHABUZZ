import { ARENA_ADMIN_LINKS } from "@/lib/site-structure";

export type AdminNavGroupId =
  | "overview"
  | "editorial"
  | "arena"
  | "events"
  | "site"
  | "audience"
  | "account";

export type AdminNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  superadmin?: boolean;
  group: AdminNavGroupId;
};

export const ADMIN_NAV_GROUPS: { id: AdminNavGroupId; label: string }[] = [
  { id: "overview", label: "Vue" },
  { id: "editorial", label: "Éditorial" },
  { id: "arena", label: "Arena Culture" },
  { id: "events", label: "Événements" },
  { id: "site", label: "Accueil & site" },
  { id: "audience", label: "Audience" },
  { id: "account", label: "Compte" },
];

export { ARENA_ADMIN_LINKS };

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Tableau de bord", exact: true, group: "overview" },
  { href: "/admin/articles", label: "Articles & chroniques", group: "editorial" },
  { href: "/admin/categories", label: "Catégories", group: "editorial" },
  { href: "/admin/pages", label: "Pages", group: "editorial" },
  { href: "/admin/arena", label: "Arena Culture", group: "arena" },
  { href: "/admin/evenements", label: "Événements", group: "events" },
  { href: "/admin/media", label: "Médias", group: "site" },
  { href: "/admin/portfolio", label: "Portfolio", group: "site" },
  { href: "/admin/partners", label: "Partenaires", group: "site" },
  { href: "/admin/artists", label: "Artistes à la une", group: "site" },
  { href: "/admin/domains", label: "Domaines", group: "site" },
  { href: "/admin/contacts", label: "Contacts", group: "audience" },
  { href: "/admin/newsletter", label: "Newsletter", group: "audience" },
  { href: "/admin/users", label: "Utilisateurs", superadmin: true, group: "account" },
  { href: "/admin/settings", label: "Paramètres", group: "account" },
];

export function isAdminNavActive(pathname: string, item: Pick<AdminNavItem, "href" | "exact">) {
  if (item.exact) return pathname === item.href;
  if (item.href === "/admin/arena") {
    return pathname === "/admin/arena" || pathname.startsWith("/admin/arena/");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function adminNavTitle(pathname: string, items: AdminNavItem[] = ADMIN_NAV) {
  if (pathname === "/admin") return "Tableau de bord";
  if (pathname.startsWith("/admin/arena")) {
    const ranked = [...ARENA_ADMIN_LINKS]
      .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length);
    return ranked[0]?.label ?? "Arena Culture";
  }
  const ranked = items
    .filter((item) => !item.exact && (pathname === item.href || pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length);
  return ranked[0]?.label ?? "Administration";
}
