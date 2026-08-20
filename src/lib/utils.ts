import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import slugifyLib from "slugify";
import { parseMediaEmbed } from "@/lib/media";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function createSlug(text: string) {
  return slugifyLib(text, { lower: true, strict: true, locale: "fr" });
}

export function formatDate(date: Date | string | null | undefined, pattern = "d MMMM yyyy") {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: fr });
}

export function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function collaborationLabel(type: string) {
  const map: Record<string, string> = {
    MEDIA: "Collaboration média",
    EVENT_COVERAGE: "Couverture événement",
    INTERVIEW: "Interview",
    PARTNERSHIP: "Partenariat",
    ADVERTISING: "Publicité",
    ARENA_CULTURE: "ARENA CULTURE",
    CONTENT_PRODUCTION: "Production de contenu",
    OTHER: "Autre",
  };
  return map[type] || type;
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    DRAFT: "Brouillon",
    SCHEDULED: "Programmé",
    PUBLISHED: "Publié",
    ARCHIVED: "Archivé",
    NEW: "Nouveau",
    IN_PROGRESS: "En cours",
    DONE: "Traité",
    ACTIVE: "Actif",
    UNSUBSCRIBED: "Désinscrit",
    SENT: "Envoyé",
    PARTIAL: "Partiel",
    FAILED: "Échec",
    NEWSLETTER: "Newsletter",
    NOTICE: "Notification",
    SOLD_OUT: "Complet",
    ENDED: "Terminé",
    CANCELLED: "Annulé",
    PAID: "Payée",
    ANNOUNCE: "Annonce",
    HEADLINE: "À la une",
    PENDING: "En cours",
    SKIPPED: "Sans abonné",
    NONE: "—",
    AWAITING_PAYMENT: "Paiement en cours",
    EXPIRED: "Expirée",
    REFUNDED: "Remboursée",
    VALID: "Valide",
    USED: "Utilisé",
  };
  return map[status] || status;
}

export function portfolioTypeLabel(type: string) {
  const map: Record<string, string> = {
    REPORTAGE: "Reportages",
    INTERVIEW: "Interviews",
    EVENT_COVERAGE: "Couvertures d'événements",
    PRODUCTION: "Productions",
    EMISSION: "Émissions",
    MEDIA_ACTIVITY: "Activités médiatiques",
  };
  return map[type] || type;
}

export function galleryCategoryLabel(cat: string) {
  const map: Record<string, string> = {
    ACTIVITES: "Activités",
    EMISSIONS: "Émissions",
    EVENEMENTS: "Événements",
    REPORTAGES: "Reportages",
    COULISSES: "Coulisses",
    ARENA_CULTURE: "Arena Culture",
  };
  return map[cat] || cat;
}

export function getVideoEmbed(url: string): { type: string; id: string } | null {
  const parsed = parseMediaEmbed(url);
  if (!parsed) return null;
  return { type: parsed.provider, id: parsed.id };
}
