"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { AdminNoticeMenu, type AdminNoticeDto } from "@/components/admin/AdminNoticeMenu";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ADMIN_NAV, ADMIN_NAV_GROUPS, adminNavTitle, isAdminNavActive } from "@/lib/admin-nav";
import { canManageUsers, roleLabel } from "@/lib/roles";

export function AdminShell({
  children,
  role,
  userName,
  notices = [],
}: {
  children: React.ReactNode;
  role?: string;
  userName?: string | null;
  notices?: AdminNoticeDto[];
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isLogin) {
    return <div className="admin-shell min-h-screen">{children}</div>;
  }

  return (
    <div className="admin-shell flex min-h-screen">
      <AdminSidebar
        role={role}
        userName={userName}
        pathname={pathname}
        notices={notices}
        className="admin-sidebar-desktop"
      />

      {open ? (
        <div className="admin-sidebar-mobile" id="admin-mobile-nav">
          <button
            type="button"
            className="admin-sidebar-backdrop"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <AdminSidebar
            role={role}
            userName={userName}
            pathname={pathname}
            notices={notices}
            onNavigate={() => setOpen(false)}
            className="admin-sidebar-drawer"
          />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-menu-btn"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="admin-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{adminNavTitle(pathname)}</p>
            <p className="truncate text-[0.65rem] uppercase tracking-[0.16em] text-[#9aa3b5]">CMS</p>
          </div>
          <AdminNoticeMenu notices={notices} />
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

function AdminSidebar({
  role,
  userName,
  pathname,
  notices = [],
  onNavigate,
  className,
}: {
  role?: string;
  userName?: string | null;
  pathname: string;
  notices?: AdminNoticeDto[];
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <aside className={className}>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <BrandLogo href="/" size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#9aa3b5]">CMS</p>
          <p className="font-[family-name:var(--font-syne)] text-lg font-bold">KISHA BUZZ</p>
        </div>
        <AdminNoticeMenu notices={notices} />
      </div>
      <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-3" aria-label="Navigation admin">
        {ADMIN_NAV_GROUPS.map((group) => {
          const items = ADMIN_NAV.filter(
            (item) => item.group === group.id && (!item.superadmin || canManageUsers(role))
          );
          if (!items.length) return null;
          return (
            <div key={group.id} className="admin-nav-group">
              <p className="admin-nav-group-label">{group.label}</p>
              {items.map((item) => {
                const active = isAdminNavActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`block rounded-md px-3 py-2 text-sm transition ${
                      active ? "bg-white/10 text-white" : "text-[#aeb6c5] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        {userName ? (
          <p className="mb-3 px-1 text-xs text-[#9aa3b5]">
            <span className="block truncate font-semibold text-white">{userName}</span>
            {roleLabel(role)}
          </p>
        ) : null}
        <Link href="/" className="admin-btn admin-btn-ghost mb-2 w-full text-xs" onClick={onNavigate}>
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
  );
}
