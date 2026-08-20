import Link from "next/link";
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

const LIST_LINKS: { id: EventListView | "categories"; href: string; label: string }[] = [
  { id: "en-cours", href: "/admin/evenements?vue=en-cours", label: "En cours" },
  { id: "brouillons", href: "/admin/evenements?vue=brouillons", label: "Brouillons" },
  { id: "passes", href: "/admin/evenements?vue=passes", label: "Passés" },
  { id: "tous", href: "/admin/evenements?vue=tous", label: "Tous" },
  { id: "categories", href: "/admin/evenements/categories", label: "Catégories" },
];

export function EventAdminNav({
  current,
  counts,
}: {
  current?: EventListView | "categories" | "nouveau";
  counts?: Partial<Record<EventListView, number>>;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {LIST_LINKS.map((item) => {
        const count = item.id !== "categories" ? counts?.[item.id] : undefined;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`admin-btn text-xs ${
              current === item.id ? "admin-btn-primary" : "admin-btn-ghost"
            }`}
          >
            {item.label}
            {typeof count === "number" ? ` (${count})` : ""}
          </Link>
        );
      })}
    </div>
  );
}

export function EventEditNav({
  eventId,
  current,
}: {
  eventId: string;
  current: EventEditTab;
}) {
  const tabs: { id: EventEditTab; label: string }[] = [
    { id: "en-cours", label: "Événement en cours" },
    { id: "fiche", label: "Fiche" },
    { id: "journal", label: "Journal" },
  ];
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/admin/evenements/${eventId}?onglet=${tab.id}`}
          className={`admin-btn text-xs ${
            current === tab.id ? "admin-btn-primary" : "admin-btn-ghost"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
