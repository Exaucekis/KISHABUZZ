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

const ARENA_NAV = [
  { href: "/arena-culture",              label: "Accueil",    exact: true,  Icon: Home },
  { href: "/arena-culture/emissions",    label: "Émissions",  exact: false, Icon: Tv },
  { href: "/arena-culture/photos",       label: "Galerie",    exact: false, Icon: Images },
  { href: "/arena-culture/invites",      label: "Invités",    exact: false, Icon: Users },
  { href: "/arena-culture/calendrier",   label: "Calendrier", exact: false, Icon: Calendar },
  { href: "/arena-culture/archives",     label: "Archives",   exact: false, Icon: Archive },
] as const;

export function ArenaSubNav() {
  const pathname = usePathname();

  return (
    <nav className="ac-nav" aria-label="Rubriques Arena Culture">
      <div className="ac-nav__inner">

        {/* Logo + label */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute", inset: "-4px",
                borderRadius: "50%",
                background: "rgba(245,158,11,0.18)",
                filter: "blur(6px)",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />
            <div style={{ position: "relative" }}>
              <ArenaLogo href="/arena-culture" size="sm" className="ac-nav__logo" priority />
            </div>
          </div>
          <span className="ac-nav__brand">Média &amp; Live</span>
        </div>

        {/* Onglets */}
        <div className="ac-nav__links" role="list">
          {ARENA_NAV.map(({ href, label, exact, Icon }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                role="listitem"
                className={`ac-nav__link${active ? " is-active" : ""}`}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Badge Live */}
        <div
          style={{
            display: "none",
            flexShrink: 0,
            alignItems: "center",
            gap: "0.35rem",
            borderRadius: "999px",
            border: "1px solid rgba(245,158,11,0.28)",
            background: "rgba(245,158,11,0.08)",
            padding: "0.25rem 0.75rem",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "rgba(245,158,11,0.9)",
          }}
          className="sm:!flex"
        >
          <Sparkles
            style={{ width: "0.75rem", height: "0.75rem", animation: "pulse 2s infinite" }}
          />
          <span>Plateau Culture</span>
        </div>
      </div>
    </nav>
  );
}
