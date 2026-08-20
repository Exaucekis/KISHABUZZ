"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Menu,
  Search,
  X,
  Mic2,
  Home,
  User,
  Newspaper,
  BookOpen,
  Briefcase,
  Handshake,
  Mail,
  LogIn,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserAccountMenu } from "@/components/layout/UserAccountMenu";
import { useIsClient } from "@/lib/use-is-client";
import { cn } from "@/lib/utils";

type HeaderUser = { name: string | null; role: string } | null;

const links = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/evenements", label: "Événements", icon: CalendarDays },
  { href: "/a-propos", label: "À propos", icon: User },
  { href: "/chroniques", label: "Chroniques", icon: BookOpen },
  { href: "/publications", label: "Publications", icon: Newspaper },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/arena-culture", label: "Arena Culture", icon: Mic2, highlight: true },
  { href: "/collaborations", label: "Partenaires", icon: Handshake },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/recherche", label: "Recherche", icon: Search },
];

const desktopLinks = [
  { href: "/", label: "Accueil" },
  { href: "/evenements", label: "Événements" },
  { href: "/a-propos", label: "À propos" },
  { href: "/chroniques", label: "Chroniques" },
  { href: "/publications", label: "Publications" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  user = null,
}: {
  siteTitle?: string;
  user?: HeaderUser;
} = {}) {
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const mounted = useIsClient();
  const menuId = useId();
  const isArena = pathname.startsWith("/arena-culture");
  const open = openForPath === pathname;
  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(openForPath === pathname) : value;
      setOpenForPath(next ? pathname : null);
    },
    [openForPath, pathname]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenForPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const drawer =
    mounted &&
    createPortal(
      <div className="xl:hidden" aria-hidden={!open}>
        <button
          type="button"
          className={cn(
            "side-overlay fixed inset-0 z-[120] border-0 transition-opacity duration-300",
            open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          )}
          aria-label="Fermer le menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />

        <aside
          id={menuId}
          className={cn(
            "side-drawer fixed inset-y-0 right-0 z-[130] flex w-[min(100vw-2.5rem,20.5rem)] flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open ? "translate-x-0" : "translate-x-[110%] pointer-events-none"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo href="/" size="sm" />
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold tracking-wide text-paper">
                  KISHA BUZZ
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ember-text">Navigation</p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg border border-line bg-ink-3 p-2 text-paper transition hover:bg-ink"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4" aria-label="Menu mobile">
            <ul className="space-y-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-3 text-[0.95rem] font-semibold transition",
                        link.highlight
                          ? "bg-ember text-on-ember shadow-lg shadow-black/10"
                          : active
                            ? "bg-ink-3 text-paper"
                            : "text-paper-muted hover:bg-ink-3 hover:text-paper"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
              <li>
                {user ? (
                  <UserAccountMenu
                    user={user}
                    variant="mobile"
                    onNavigate={() => setOpen(false)}
                  />
                ) : (
                  <Link
                    href="/connexion"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-ember px-3.5 py-3 text-[0.95rem] font-semibold text-on-ember"
                  >
                    <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                    <span>Connexion</span>
                  </Link>
                )}
              </li>
            </ul>
          </nav>

          <div className="border-t border-line p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-paper-muted">Thème</p>
              <ThemeToggle />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-paper-muted">Contact</p>
            <a
              href="tel:0974105940"
              className="mt-2 inline-flex text-lg font-bold tracking-wide text-ember-text"
            >
              0974105940
            </a>
          </div>
        </aside>
      </div>,
      document.body
    );

  return (
    <>
      <header
        className={cn(
          "site-header fixed inset-x-0 top-0 z-[100] transition-all duration-300",
          isArena && "site-header--on-arena",
          scrolled || open ? "site-header-solid" : "site-header-clear"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] md:px-6">
          <BrandLogo size="sm" priority />

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label={isArena ? "Retour au site" : "Navigation principale"}
          >
            {isArena ? (
              <Link
                href="/"
                className="rounded-md px-2.5 py-2 text-[0.8rem] font-medium text-paper-muted transition hover:text-paper xl:px-3 xl:text-sm"
              >
                KISHA BUZZ
              </Link>
            ) : (
              <>
                {desktopLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-2.5 py-2 text-[0.8rem] font-medium text-paper-muted transition hover:text-paper xl:px-3 xl:text-sm",
                      pathname === link.href && "bg-ink-3 text-paper"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/arena-culture"
                  className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-ember px-3 py-2 text-[0.8rem] font-bold text-on-ember transition hover:bg-ember-hot xl:text-sm"
                >
                  <Mic2 className="h-3.5 w-3.5" aria-hidden />
                  <span>Arena</span>
                  <span className="hidden xl:inline">Culture</span>
                </Link>
              </>
            )}
            <Link
              href="/recherche"
              className="rounded-md p-2 text-paper-muted transition hover:bg-ink-3 hover:text-paper"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </Link>
            <ThemeToggle className="ml-1" />
            {user ? (
              <UserAccountMenu user={user} />
            ) : (
              <Link
                href="/connexion"
                className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-2 text-[0.8rem] font-semibold text-paper hover:bg-ink-3 xl:text-sm"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden />
                Connexion
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <UserAccountMenu user={user} />
            ) : (
              <Link
                href="/connexion"
                className="inline-flex items-center gap-1 rounded-xl bg-ember px-2.5 py-2 text-xs font-bold text-on-ember"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden />
                Login
              </Link>
            )}
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-ink-2 text-paper shadow-sm"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      {drawer}
    </>
  );
}
