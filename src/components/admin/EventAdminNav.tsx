import Link from "next/link";

export const EVENT_ADMIN_LINKS = [
  { href: "/admin/evenements", label: "Événements" },
  { href: "/admin/evenements/categories", label: "Catégories" },
] as const;

export function EventAdminNav({ current }: { current?: string }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {EVENT_ADMIN_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`admin-btn text-xs ${
            current === item.href ? "admin-btn-primary" : "admin-btn-ghost"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
