"use client";

import { useState, type ReactNode } from "react";
import { AdminTabs } from "@/components/admin/AdminTabs";

const TABS = [
  {
    id: "editorial",
    label: "À traiter",
    hint: "Articles, brouillons, messages",
  },
  {
    id: "arena",
    label: "Arena Culture",
    hint: "Émissions, invités, vidéos",
  },
  {
    id: "site",
    label: "Accueil & site",
    hint: "Hero, artistes, partenaires",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminHomeTabs({
  editorial,
  arena,
  site,
}: {
  editorial: ReactNode;
  arena: ReactNode;
  site: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("editorial");
  const panels: Record<TabId, ReactNode> = { editorial, arena, site };

  return (
    <div>
      <AdminTabs
        label="Sections du tableau de bord"
        items={TABS.map((item) => ({
          ...item,
          active: tab === item.id,
          onSelect: () => setTab(item.id),
        }))}
      />
      <div role="tabpanel">{panels[tab]}</div>
    </div>
  );
}
