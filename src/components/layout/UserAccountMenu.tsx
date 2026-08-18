"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { BarChart3, ChevronDown, LayoutDashboard, LogOut, ScanLine, Sparkles, Ticket, User } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useIsClient } from "@/lib/use-is-client";
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

function menuPosition(trigger: HTMLElement | null) {
  const rect = trigger?.getBoundingClientRect();
  if (!rect) return { top: 64, right: 12 };
  return {
    top: rect.bottom + 10,
    right: Math.max(12, window.innerWidth - rect.right),
  };
}

export function UserAccountMenu({ user, variant = "desktop", onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const mounted = useIsClient();
  const [coords, setCoords] = useState({ top: 64, right: 12 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const label = user.name?.trim() || roleLabel(user.role);
  const showDashboard = canAccessAdmin(user.role);
  const showUsers = canManageUsers(user.role);
  const initials = userInitials(user.name, user.role);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  useEffect(() => {
    if (!open || variant !== "desktop") return;

    const updatePosition = () => setCoords(menuPosition(triggerRef.current));
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
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const profileCard = (
    <div className="user-menu-profile-card">
      <span className="user-menu-avatar user-menu-avatar--live" aria-hidden>
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-paper">{label}</p>
        <span className={roleBadgeClass(user.role)}>{roleLabel(user.role)}</span>
        <p className="mt-1 truncate text-[0.72rem] text-paper-muted">Espace membre KISHA BUZZ</p>
      </div>
    </div>
  );

  const menuItems = (
    <div className="space-y-0.5">
      <Link href="/compte" role="menuitem" className="user-menu-item group" onClick={close}>
        <span className="user-menu-icon">
          <User className="h-4 w-4" aria-hidden />
        </span>
        <span className="flex-1 text-left">
          <span className="block">Mon compte</span>
          <span className="block text-[0.72rem] font-normal text-paper-muted">Profil et mot de passe</span>
        </span>
      </Link>

      <Link href="/compte/billets" role="menuitem" className="user-menu-item group" onClick={close}>
        <span className="user-menu-icon">
          <Ticket className="h-4 w-4" aria-hidden />
        </span>
        <span className="flex-1 text-left">
          <span className="block">Mes billets</span>
          <span className="block text-[0.72rem] font-normal text-paper-muted">Événements et QR code</span>
        </span>
      </Link>

      {showDashboard ? (
        <Link href="/organisateur" role="menuitem" className="user-menu-item group" onClick={close}>
          <span className="user-menu-icon">
            <BarChart3 className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex-1 text-left">
            <span className="block">Espace organisateur</span>
            <span className="block text-[0.72rem] font-normal text-paper-muted">Ventes et contrôles</span>
          </span>
        </Link>
      ) : null}

      {showDashboard ? (
        <Link href="/scan" role="menuitem" className="user-menu-item group" onClick={close}>
          <span className="user-menu-icon">
            <ScanLine className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex-1 text-left">
            <span className="block">Contrôle d’entrée</span>
            <span className="block text-[0.72rem] font-normal text-paper-muted">Scanner les billets</span>
          </span>
        </Link>
      ) : null}

      {showDashboard ? (
        <Link
          href="/admin"
          role="menuitem"
          className="user-menu-item group user-menu-item--accent"
          onClick={close}
        >
          <span className="user-menu-icon user-menu-icon--accent">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex-1 text-left">
            <span className="block">Tableau de bord</span>
            <span className="block text-[0.72rem] font-normal text-paper-muted">CMS et contenus</span>
          </span>
        </Link>
      ) : null}

      {showUsers ? (
        <Link href="/admin/users" role="menuitem" className="user-menu-item group" onClick={close}>
          <span className="user-menu-icon">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex-1 text-left">
            <span className="block">Utilisateurs</span>
            <span className="block text-[0.72rem] font-normal text-paper-muted">Rôles et comptes</span>
          </span>
        </Link>
      ) : null}

      <div className="my-1.5 h-px bg-line/80" role="separator" />

      <button
        type="button"
        role="menuitem"
        className="user-menu-item group user-menu-item--danger w-full"
        onClick={() => {
          setOpen(false);
          onNavigate?.();
          setConfirmOut(true);
        }}
      >
        <span className="user-menu-icon user-menu-icon--danger">
          <LogOut className="h-4 w-4" aria-hidden />
        </span>
        <span className="flex-1 text-left">
          <span className="block">Déconnexion</span>
          <span className="block text-[0.72rem] font-normal text-red-200/70">Quitter la session</span>
        </span>
      </button>
    </div>
  );

  const confirm = (
    <ConfirmDialog
      open={confirmOut}
      title="Se déconnecter ?"
      description="Vous quitterez votre session KISHA BUZZ. Vous pourrez vous reconnecter à tout moment avec votre email et mot de passe."
      confirmLabel="Oui, me déconnecter"
      cancelLabel="Rester connecté"
      loading={signingOut}
      variant="danger"
      onCancel={() => {
        if (!signingOut) setConfirmOut(false);
      }}
      onConfirm={() => {
        startSignOut(async () => {
          await signOutAction();
        });
      }}
    />
  );

  if (variant === "mobile") {
    return (
      <div className="user-menu-mobile space-y-1.5">
        {profileCard}
        {menuItems}
        {confirm}
      </div>
    );
  }

  const dropdown =
    mounted &&
    open &&
    createPortal(
      <div
        ref={panelRef}
        id={menuId}
        role="menu"
        className="user-menu-panel user-menu-panel--open fixed z-[240] w-[min(calc(100vw-1.5rem),18rem)]"
        style={{ top: coords.top, right: coords.right }}
      >
        <div className="border-b border-line/80">{profileCard}</div>
        <div className="p-1.5">{menuItems}</div>
      </div>,
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
        onClick={() => {
          setCoords(menuPosition(triggerRef.current));
          setOpen((value) => !value);
        }}
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
      {confirm}
    </>
  );
}
