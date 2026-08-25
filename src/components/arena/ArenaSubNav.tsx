"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Calendar,
  Home,
  Images,
  Sparkles,
  Tv,
  Users,
} from "lucide-react";
import { ArenaLogo } from "@/components/brand/ArenaLogo";
import { cn } from "@/lib/utils";

const EXTENDED_ARENA_NAV = [
  { href: "/arena-culture", label: "Accueil", exact: true, icon: Home },
  { href: "/arena-culture/emissions", label: "Émissions", exact: false, icon: Tv },
  { href: "/arena-culture/photos", label: "Galerie", exact: false, icon: Images },
  { href: "/arena-culture/invites", label: "Invités", exact: false, icon: Users },
  { href: "/arena-culture/calendrier", label: "Calendrier", exact: false, icon: Calendar },
  { href: "/arena-culture/archives", label: "Archives", exact: false, icon: Archive },
] as const;

export function ArenaSubNav() {
  const pathname = usePathname();

  return (
    <nav className="ac-nav group sticky top-16 z-40 border-b border-amber-500/20 bg-[#050505]/90 backdrop-blur-2xl transition-colors duration-300 hover:border-amber-500/40 sm:top-[4.25rem]" aria-label="Rubriques Arena Culture">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        
        {/* Logo Arena Culture */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-amber-500/20 blur-sm transition-all group-hover:bg-amber-500/30" />
            <ArenaLogo href="/arena-culture" size="sm" className="relative ac-nav__logo" priority />
          </div>
          <span className="hidden text-[0.65rem] font-black uppercase tracking-[0.25em] text-amber-400/80 md:inline-block">
            Média &amp; Live
          </span>
        </div>

        {/* Onglets Animés avec Icônes & Design Luxe */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1 scrollbar-none sm:gap-2">
          {EXTENDED_ARENA_NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group/link relative inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-all duration-300 sm:px-4 sm:text-sm",
                  active
                    ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold shadow-lg shadow-amber-500/25 scale-105"
                    : "text-white/70 hover:bg-white/10 hover:text-white hover:scale-102 border border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-300 group-hover/link:scale-110",
                    active ? "text-black" : "text-amber-400/80 group-hover/link:text-amber-300"
                  )}
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap">{item.label}</span>
                
                {active ? (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" aria-hidden="true" />
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Badge Live / Direct */}
        <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[0.7rem] font-bold text-amber-300 sm:flex">
          <Sparkles className="h-3 w-3 animate-pulse text-amber-400" />
          <span>Plateau Culture</span>
        </div>
      </div>
    </nav>
  );
}
