import { AdminTabs } from "@/components/admin/AdminTabs";
import {
  type EventEditTab,
  type EventListView,
} from "@/lib/event-admin-views";

export {
  matchesEventListView,
  parseEventEditTab,
  parseEventListView,
  type EventEditTab,
  type EventListView,
} from "@/lib/event-admin-views";

const LIST_LINKS: {
  id: EventListView | "categories";
  href: string;
  label: string;
  hint: string;
}[] = [
  { id: "en-cours", href: "/admin/evenements?vue=en-cours", label: "En cours", hint: "Publiés, vente ouverte" },
  { id: "brouillons", href: "/admin/evenements?vue=brouillons", label: "Brouillons", hint: "Pas encore en ligne" },
  { id: "passes", href: "/admin/evenements?vue=passes", label: "Passés", hint: "Terminés ou annulés" },
  { id: "tous", href: "/admin/evenements?vue=tous", label: "Tous", hint: "Liste complète" },
  { id: "categories", href: "/admin/evenements/categories", label: "Catégories", hint: "Rubriques billetterie" },
];

export function EventAdminNav({
  current,
  counts,
}: {
  current?: EventListView | "categories" | "nouveau";
  counts?: Partial<Record<EventListView, number>>;
}) {
  return (
    <AdminTabs
      label="Listes événements"
      items={LIST_LINKS.map((item) => {
        const count = item.id !== "categories" ? counts?.[item.id] : undefined;
        return {
          id: item.id,
          href: item.href,
          label: typeof count === "number" ? `${item.label} (${count})` : item.label,
          hint: item.hint,
          active: current === item.id,
        };
      })}
    />
  );
}

export function EventEditNav({
  eventId,
  current,
}: {
  eventId: string;
  current: EventEditTab;
}) {
  const tabs: { id: EventEditTab; label: string; hint: string }[] = [
    { id: "en-cours", label: "Événement en cours", hint: "Vente et contrôle" },
    { id: "fiche", label: "Fiche", hint: "Titre, date, visuel" },
    { id: "journal", label: "Journal", hint: "Historique des actions" },
  ];
  return (
    <AdminTabs
      label="Fiche événement"
      items={tabs.map((tab) => ({
        id: tab.id,
        href: `/admin/evenements/${eventId}?onglet=${tab.id}`,
        label: tab.label,
        hint: tab.hint,
        active: current === tab.id,
      }))}
    />
  );
}
