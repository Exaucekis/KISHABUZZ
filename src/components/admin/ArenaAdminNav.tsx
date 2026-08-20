import Link from "next/link";

export const ARENA_ADMIN_LINKS = [
  { href: "/admin/arena", label: "Tableau de bord" },
  { href: "/admin/arena/emissions", label: "Émissions" },
  { href: "/admin/arena/guests", label: "Invités" },
  { href: "/admin/arena/videos", label: "Vidéos" },
  { href: "/admin/arena/albums", label: "Albums" },
  { href: "/admin/arena/seasons", label: "Saisons" },
  { href: "/admin/arena/archives", label: "Archives" },
] as const;

export function ArenaAdminNav({ current }: { current?: string }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {ARENA_ADMIN_LINKS.map((item) => (
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
