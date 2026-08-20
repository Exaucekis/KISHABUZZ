"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArenaLogo } from "@/components/brand/ArenaLogo";
import { ARENA_NAV } from "@/lib/site-structure";
import { cn } from "@/lib/utils";

export function ArenaSubNav() {
  const pathname = usePathname();

  return (
    <nav className="ac-nav" aria-label="Rubriques Arena Culture">
      <div className="ac-nav__inner">
        <ArenaLogo href="/arena-culture" size="sm" className="ac-nav__logo" priority />
        <div className="ac-nav__links">
          {ARENA_NAV.map((item) => {
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
