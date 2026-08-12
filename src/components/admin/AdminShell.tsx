"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BrandLogo } from "@/components/brand/BrandLogo";

const NAV = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/articles", label: "Articles & chroniques" },
  { href: "/admin/arena", label: "Arena Culture" },
  { href: "/admin/arena/guests", label: "Invités" },
  { href: "/admin/arena/seasons", label: "Saisons" },
  { href: "/admin/arena/albums", label: "Albums photos" },
  { href: "/admin/media", label: "Médias" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/partners", label: "Partenaires" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/domains", label: "Domaines" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/settings", label: "Paramètres" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="admin-shell min-h-screen">{children}</div>;
  }

  return (
    <div className="admin-shell flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-[#0a0d13]">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <BrandLogo href="/" size="sm" />
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#9aa3b5]">CMS</p>
            <p className="font-[family-name:var(--font-syne)] text-lg font-bold">KISHA BUZZ</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {NAV.map((item) => {
            let active = false;
            if (item.exact) {
              active = pathname === item.href;
            } else if (item.href === "/admin/arena") {
              active =
                pathname === "/admin/arena" ||
                pathname.startsWith("/admin/arena/new") ||
                (/^\/admin\/arena\/[^/]+$/.test(pathname) &&
                  !pathname.startsWith("/admin/arena/guests") &&
                  !pathname.startsWith("/admin/arena/seasons") &&
                  !pathname.startsWith("/admin/arena/albums"));
            } else {
              active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-[#aeb6c5] hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link href="/" className="admin-btn admin-btn-ghost mb-2 w-full text-xs">
            Voir le site
          </Link>
          <button
            type="button"
            className="admin-btn admin-btn-danger w-full text-xs"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Déconnexion
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-5 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
