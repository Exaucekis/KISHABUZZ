"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Sparkles, User } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { canAccessAdmin, canManageUsers, roleLabel } from "@/lib/roles";

type Props = {
  user: { name: string | null; role: string };
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

function userInitials(name: string | null, role: string) {
  const source = name?.trim() || roleLabel(role);
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function roleBadgeClass(role: string) {
  switch (role) {
    case "SUPERADMIN":
      return "user-role-badge user-role-badge--super";
    case "ADMIN":
      return "user-role-badge user-role-badge--admin";
    case "EDITOR":
    case "AUTHOR":
      return "user-role-badge user-role-badge--staff";
    default:
      return "user-role-badge";
  }
}

export function UserAccountMenu({ user, variant = "desktop", onNavigate }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [signingOut, startSignOut] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const label = user.name?.trim() || roleLabel(user.role);
  const showDashboard = canAccessAdmin(user.role);
  const showUsers = canManageUsers(user.role);
  const initials = userInitials(user.name, user.role);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || variant !== "desktop") return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({
        top: rect.bottom + 10,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  const navigate = (href: string) => {
    setPendingPath(href);
    close();
    router.push(href);
    router.refresh();
    window.setTimeout(() => setPendingPath(null), 1200);
  };

  const handleSignOut = () => {
    close();
    startSignOut(async () => {
      await signOutAction();
    });
  };

  const menuItems = (
    <>
      <button
        type="button"
        role="menuitem"
        disabled={!!pendingPath}
        className={cn("user-menu-item group", pendingPath === "/compte" && "user-menu-item--loading")}
        onClick={() => navigate("/compte")}
      >
        <span className="user-menu-icon">
          <User className="h-4 w-4" aria-hidden />
        </span>
        <span className="flex-1 text-left">
          <span className="block">Mon compte</span>
          <span className="block text-[0.72rem] font-normal text-paper-muted">Profil et mot de passe</span>
        </span>
      </button>

      {showDashboard ? (
        <button
          type="button"
          role="menuitem"
          disabled={!!pendingPath}
          className={cn(
            "user-menu-item group user-menu-item--accent",
            pendingPath === "/admin" && "user-menu-item--loading"
          )}
          onClick={() => navigate("/admin")}
        >
          <span className="user-menu-icon user-menu-icon--accent">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex-1 text-left">
            <span className="block">Tableau de bord</span>
            <span className="block text-[0.72rem] font-normal text-paper-muted">CMS et contenus</span>
          </span>
        </button>
      ) : null}

      {showUsers ? (
        <button
          type="button"
          role="menuitem"
          disabled={!!pendingPath}
          className={cn(
            "user-menu-item group",
            pendingPath === "/admin/users" && "user-menu-item--loading"
          )}
          onClick={() => navigate("/admin/users")}
        >
          <span className="user-menu-icon">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex-1 text-left">
            <span className="block">Utilisateurs</span>
            <span className="block text-[0.72rem] font-normal text-paper-muted">Rôles et comptes</span>
          </span>
        </button>
      ) : null}

      <div className="my-1.5 h-px bg-line/80" role="separator" />

      <button
        type="button"
        role="menuitem"
        disabled={signingOut || !!pendingPath}
        className={cn("user-menu-item group user-menu-item--danger", signingOut && "user-menu-item--loading")}
        onClick={handleSignOut}
      >
        <span className="user-menu-icon user-menu-icon--danger">
          <LogOut className="h-4 w-4" aria-hidden />
        </span>
        <span className="flex-1 text-left">
          <span className="block">{signingOut ? "Déconnexion…" : "Déconnexion"}</span>
        </span>
      </button>
    </>
  );

  if (variant === "mobile") {
    return (
      <div className="user-menu-mobile space-y-1.5">
        <div className="user-menu-profile-card">
          <span className="user-menu-avatar" aria-hidden>
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-paper">{label}</p>
            <span className={roleBadgeClass(user.role)}>{roleLabel(user.role)}</span>
          </div>
        </div>
        <div className="space-y-1">{menuItems}</div>
      </div>
    );
  }

  const dropdown =
    mounted &&
    open &&
    createPortal(
      <>
        <button
          type="button"
          className="user-menu-backdrop user-menu-backdrop--open fixed inset-0 z-[190] border-0"
          aria-label="Fermer le menu compte"
          onClick={() => setOpen(false)}
        />
        <div
          ref={panelRef}
          id={menuId}
          role="menu"
          className="user-menu-panel user-menu-panel--open fixed z-[200] w-[min(calc(100vw-1.5rem),17.5rem)]"
          style={{ top: coords.top, right: coords.right }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="user-menu-profile-card border-b border-line/80">
            <span className="user-menu-avatar user-menu-avatar--live" aria-hidden>
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-paper">{label}</p>
              <span className={roleBadgeClass(user.role)}>{roleLabel(user.role)}</span>
            </div>
          </div>
          <div className="p-1.5">{menuItems}</div>
        </div>
      </>,
      document.body
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "user-menu-trigger inline-flex max-w-[12rem] items-center gap-2 rounded-full border border-line/80 bg-ink-2/80 py-1.5 pl-1.5 pr-2.5 text-[0.8rem] font-semibold text-paper shadow-sm backdrop-blur-sm transition hover:border-ember-text/30 hover:bg-ink-3 xl:max-w-[14rem] xl:text-sm",
          open && "border-ember-text/40 bg-ink-3 ring-2 ring-ember-text/15"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="user-menu-avatar user-menu-avatar--sm" aria-hidden>
          {initials}
        </span>
        <span className="truncate">{label.split(" ")[0]}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 text-paper-muted transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {dropdown}
    </>
  );
}
