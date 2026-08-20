import { AdminTabs } from "@/components/admin/AdminTabs";
import { ARENA_ADMIN_LINKS } from "@/lib/admin-nav";

export { ARENA_ADMIN_LINKS };

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
