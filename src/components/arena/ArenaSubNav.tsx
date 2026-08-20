"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/arena-culture", label: "Accueil", exact: true },
  { href: "/arena-culture/emissions", label: "Émissions" },
  { href: "/arena-culture/invites", label: "Invités" },
  { href: "/arena-culture/affiches", label: "Affiches" },
  { href: "/arena-culture/photos", label: "Photos" },
  { href: "/arena-culture/videos", label: "Vidéos" },
  { href: "/arena-culture/archives", label: "Archives" },
];

export function ArenaSubNav() {
  const pathname = usePathname();

  return (
    <nav className="ac-nav" aria-label="Rubriques Arena Culture">
      <div className="ac-nav__inner">
        <div className="ac-nav__links">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("ac-nav__link", active && "is-active")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
