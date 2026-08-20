import { AdminTabs } from "@/components/admin/AdminTabs";

export const ARENA_ADMIN_LINKS = [
  { href: "/admin/arena", label: "Page Arena", hint: "Textes et visuels de /arena-culture" },
  { href: "/admin/arena/prochain-invite", label: "Prochain invité", hint: "Annoncer : visible tout de suite sur l’accueil" },
  { href: "/admin/arena/emissions", label: "Émissions", hint: "Créer, publier, à la une" },
  { href: "/admin/arena/guests", label: "Invités", hint: "Portraits et fiches" },
  { href: "/admin/arena/videos", label: "Vidéos", hint: "Replays et extraits" },
  { href: "/admin/arena/albums", label: "Albums", hint: "Photos plateau" },
  { href: "/admin/arena/seasons", label: "Saisons", hint: "Découpage de l’année" },
  { href: "/admin/arena/archives", label: "Archives", hint: "Anciennes émissions" },
  { href: "/admin/arena/alertes", label: "Alertes", hint: "Emails et WhatsApp" },
] as const;

export function ArenaAdminNav({ current }: { current?: string }) {
  return (
    <AdminTabs
      label="Rubriques Arena"
      items={ARENA_ADMIN_LINKS.map((item) => ({
        id: item.href,
        href: item.href,
        label: item.label,
        hint: item.hint,
        active: current === item.href,
      }))}
    />
  );
}
