"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Crown,
  LayoutDashboard,
  LogOut,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  Users,
} from "lucide-react";
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

  const isSuperAdmin = user.role === "SUPERADMIN";
  const isAdmin = user.role === "ADMIN" || isSuperAdmin;

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  function menuPosition(trigger: HTMLElement | null) {
    const rect = trigger?.getBoundingClientRect();
    if (!rect) return { top: 64, right: 12 };
    return {
      top: rect.bottom + 10,
      right: Math.max(12, window.innerWidth - rect.right),
    };
  }

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

  // ─── Profil Header Card Premium ───
  const profileCard = (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1f2c] via-[#121622] to-[#0a0d14] p-3.5 shadow-xl">
      {/* Halo lumineux de fond */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-center gap-3">
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 text-sm font-black text-black shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
            {initials}
          </div>
          {isSuperAdmin ? (
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black shadow">
              <Crown className="h-2.5 w-2.5" />
            </div>
          ) : isAdmin ? (
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white shadow">
              <ShieldCheck className="h-2.5 w-2.5" />
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold tracking-tight text-white">{label}</p>
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider",
                isSuperAdmin
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                  : isAdmin
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-white/10 text-gray-300 border border-white/10"
              )}
            >
              <Sparkles className="h-2.5 w-2.5 opacity-80" />
              {roleLabel(user.role)}
            </span>
            <span className="text-[0.68rem] text-white/40">· Espace membre</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Menu Navigation Items ───
  const menuItems = (
    <div className="space-y-3 pt-2">
      {/* Groupe : Compte Personnel */}
      <div>
        <p className="px-2 pb-1 text-[0.65rem] font-bold uppercase tracking-widest text-white/40">
          Mon Espace
        </p>
        <div className="space-y-1">
          <Link
            href="/compte"
            role="menuitem"
            className="group flex items-center justify-between rounded-xl border border-transparent p-2.5 text-sm transition-all hover:border-white/10 hover:bg-white/[0.06]"
            onClick={close}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-400/10 group-hover:text-amber-300">
                <User className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Mon compte
                </p>
                <p className="text-[0.72rem] text-white/50">Profil et mot de passe</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-300" />
          </Link>

          <Link
            href="/compte/billets"
            role="menuitem"
            className="group flex items-center justify-between rounded-xl border border-transparent p-2.5 text-sm transition-all hover:border-white/10 hover:bg-white/[0.06]"
            onClick={close}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-400/10 group-hover:text-amber-300">
                <Ticket className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Mes billets
                </p>
                <p className="text-[0.72rem] text-white/50">Événements et QR code</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-300" />
          </Link>
        </div>
      </div>

      {/* Groupe : Outils & Administration */}
      {showDashboard ? (
        <div>
          <p className="px-2 pb-1 text-[0.65rem] font-bold uppercase tracking-widest text-amber-400/60">
            Gestion & Administration
          </p>
          <div className="space-y-1">
            <Link
              href="/organisateur"
              role="menuitem"
              className="group flex items-center justify-between rounded-xl border border-transparent p-2.5 text-sm transition-all hover:border-white/10 hover:bg-white/[0.06]"
              onClick={close}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-400/10 group-hover:text-amber-300">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                    Espace organisateur
                  </p>
                  <p className="text-[0.72rem] text-white/50">Ventes et billetterie</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-300" />
            </Link>

            <Link
              href="/scan"
              role="menuitem"
              className="group flex items-center justify-between rounded-xl border border-transparent p-2.5 text-sm transition-all hover:border-white/10 hover:bg-white/[0.06]"
              onClick={close}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-400/10 group-hover:text-amber-300">
                  <ScanLine className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                    Contrôle d’entrée
                  </p>
                  <p className="text-[0.72rem] text-white/50">Scanner les billets</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-300" />
            </Link>

            <Link
              href="/admin"
              role="menuitem"
              className="group flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-2.5 text-sm transition-all hover:border-amber-500/40 hover:bg-amber-500/[0.1]"
              onClick={close}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/15 text-amber-300">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-amber-300">Tableau de bord CMS</p>
                  <p className="text-[0.72rem] text-amber-200/60">Gestion générale & contenus</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-300 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {showUsers ? (
              <Link
                href="/admin/users"
                role="menuitem"
                className="group flex items-center justify-between rounded-xl border border-transparent p-2.5 text-sm transition-all hover:border-white/10 hover:bg-white/[0.06]"
                onClick={close}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-400/10 group-hover:text-amber-300">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                      Utilisateurs & rôles
                    </p>
                    <p className="text-[0.72rem] text-white/50">Comptes et autorisations</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-300" />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Séparateur & Bouton Déconnexion */}
      <div className="pt-1">
        <button
          type="button"
          role="menuitem"
          className="group flex w-full items-center justify-between rounded-xl border border-red-500/20 bg-red-500/[0.05] p-2.5 text-sm transition-all hover:border-red-500/40 hover:bg-red-500/[0.12]"
          onClick={() => {
            setOpen(false);
            onNavigate?.();
            setConfirmOut(true);
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/15 text-red-400 transition-colors group-hover:bg-red-500/25 group-hover:text-red-300">
              <LogOut className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-red-300">Déconnexion</p>
              <p className="text-[0.72rem] text-red-300/60">Fermer la session en toute sécurité</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-red-400/40 transition-transform group-hover:translate-x-0.5 group-hover:text-red-300" />
        </button>
      </div>
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

  // ─── Vue Mobile (Dans le tiroir de navigation) ───
  if (variant === "mobile") {
    return (
      <div className="user-menu-mobile rounded-2xl border border-white/10 bg-black/40 p-3 shadow-inner">
        {profileCard}
        {menuItems}
        {confirm}
      </div>
    );
  }

  // ─── Vue Desktop (Dropdown Popover) ───
  const dropdown =
    mounted &&
    open &&
    createPortal(
      <div
        ref={panelRef}
        id={menuId}
        role="menu"
        className="user-menu-panel user-menu-panel--open fixed z-[240] w-[min(calc(100vw-1.5rem),21rem)] rounded-2xl border border-white/15 bg-[#0e121a]/95 p-3.5 shadow-2xl backdrop-blur-2xl"
        style={{ top: coords.top, right: coords.right }}
      >
        {profileCard}
        {menuItems}
      </div>,
      document.body
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "user-menu-trigger inline-flex max-w-[13rem] items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] py-1.5 pl-1.5 pr-3 text-[0.8rem] font-semibold text-white shadow-sm backdrop-blur-md transition-all hover:border-amber-400/50 hover:bg-white/[0.08] xl:max-w-[15rem] xl:text-sm",
          open && "border-amber-400/60 bg-white/[0.1] ring-2 ring-amber-400/20"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => {
          setCoords(menuPosition(triggerRef.current));
          setOpen((value) => !value);
        }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-xs font-black text-black shadow-md ring-1 ring-white/30" aria-hidden>
          {initials}
        </span>
        <span className="truncate">{label.split(" ")[0]}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 text-white/50 transition-transform duration-200", open && "rotate-180 text-amber-300")}
          aria-hidden
        />
      </button>
      {dropdown}
      {confirm}
    </>
  );
}
