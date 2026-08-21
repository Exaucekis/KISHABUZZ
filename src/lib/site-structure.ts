import {
  CalendarDays,
  Home,
  User,
  Newspaper,
  BookOpen,
  Briefcase,
  Handshake,
  Mail,
  Mic2,
  Search,
  type LucideIcon,
} from "lucide-react";

/** Navigation KISHA BUZZ — une seule liste pour header, menu mobile et pied de page. */
export const SITE_NAV = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/evenements", label: "Événements", icon: CalendarDays },
  { href: "/a-propos", label: "À propos", icon: User },
  { href: "/chroniques", label: "Chroniques", icon: BookOpen },
  { href: "/publications", label: "Publications", icon: Newspaper },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/collaborations", label: "Partenaires", icon: Handshake },
  { href: "/contact", label: "Contact", icon: Mail },
] as const;

/** Barre desktop compacte : Partenaires reste dans le menu mobile et le pied. */
export const SITE_NAV_DESKTOP = SITE_NAV.filter((item) => item.href !== "/collaborations");

export const SITE_ARENA = {
  href: "/arena-culture",
  label: "Arena Culture",
  icon: Mic2,
} as const;

export const SITE_SEARCH = { href: "/recherche", label: "Recherche", icon: Search } as const;

/** Menu KISHA BUZZ avec Arena après Portfolio — mobile et pied de page. */
export const SITE_NAV_WITH_ARENA = [
  ...SITE_NAV.slice(0, 6),
  SITE_ARENA,
  ...SITE_NAV.slice(6),
] as const;

/** Rubriques publiques Arena — identiques partout. */
export const ARENA_NAV = [
  { href: "/arena-culture", label: "Accueil", exact: true },
  { href: "/arena-culture/emissions", label: "Émissions" },
  { href: "/arena-culture/invites", label: "Invités" },
  { href: "/arena-culture/affiches", label: "Affiches" },
  { href: "/arena-culture/photos", label: "Galerie" },
  { href: "/arena-culture/archives", label: "Archives" },
] as const;

/**
 * Onglets admin Arena : même ordre que le public,
 * plus Prochain invité / Saisons / Alertes (réservés au CMS).
 */
export const ARENA_ADMIN_LINKS = [
  { href: "/admin/arena", label: "Page Arena", hint: "Textes de l’accueil Arena" },
  { href: "/admin/arena/prochain-invite", label: "Prochain invité", hint: "Affiche annoncée" },
  { href: "/admin/arena/emissions", label: "Émissions", hint: "Invité, domaine, vidéo, miniature" },
  { href: "/admin/arena/guests", label: "Invités", hint: "Portraits et fiches" },
  { href: "/admin/arena/albums", label: "Galerie", hint: "Albums photos, un par invité" },
  { href: "/admin/arena/archives", label: "Archives", hint: "Anciennes émissions" },
  { href: "/admin/arena/seasons", label: "Saisons", hint: "Découpage de l’année" },
  { href: "/admin/arena/alertes", label: "Alertes", hint: "Email et WhatsApp" },
] as const;

export type SiteNavIcon = LucideIcon;
