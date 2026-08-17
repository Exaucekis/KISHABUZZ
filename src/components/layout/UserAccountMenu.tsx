"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { canAccessAdmin, roleLabel } from "@/lib/roles";

type Props = {
  user: { name: string | null; role: string };
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function UserAccountMenu({ user, variant = "desktop", onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const label = user.name?.trim() || roleLabel(user.role);
  const showDashboard = canAccessAdmin(user.role);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  if (variant === "mobile") {
    return (
      <div className="space-y-1.5">
        <div className="rounded-xl border border-line bg-ink-3/60 px-3.5 py-3">
          <p className="truncate text-sm font-semibold text-paper">{label}</p>
          <p className="text-xs text-paper-muted">{roleLabel(user.role)}</p>
        </div>
        <Link
          href="/compte"
          onClick={close}
          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[0.95rem] font-semibold text-paper-muted transition hover:bg-ink-3 hover:text-paper"
        >
          <User className="h-4 w-4 shrink-0" aria-hidden />
          Mon compte
        </Link>
        {showDashboard ? (
          <Link
            href="/admin"
            onClick={close}
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[0.95rem] font-semibold text-paper-muted transition hover:bg-ink-3 hover:text-paper"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
            Tableau de bord
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => {
            close();
            void signOut({ callbackUrl: "/connexion" });
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[0.95rem] font-semibold text-red-300 transition hover:bg-ink-3"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative ml-1">
      <button
        type="button"
        className={cn(
          "user-menu-trigger inline-flex max-w-[11rem] items-center gap-1.5 rounded-md border border-line px-2.5 py-2 text-[0.8rem] font-semibold text-paper transition hover:bg-ink-3 xl:max-w-[13rem] xl:text-sm",
          open && "bg-ink-3"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <User className="h-3.5 w-3.5 shrink-0 text-paper-muted" aria-hidden />
        <span className="truncate">{label}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 text-paper-muted transition", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="user-menu-panel absolute right-0 z-[110] mt-2 w-56 overflow-hidden rounded-lg border border-line bg-ink-2 shadow-xl"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-paper">{label}</p>
            <p className="text-xs text-paper-muted">{roleLabel(user.role)}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/compte"
              role="menuitem"
              className="user-menu-item"
              onClick={close}
            >
              <User className="h-4 w-4" aria-hidden />
              Mon compte
            </Link>
            {showDashboard ? (
              <Link
                href="/admin"
                role="menuitem"
                className="user-menu-item"
                onClick={close}
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                Tableau de bord
              </Link>
            ) : null}
            <button
              type="button"
              role="menuitem"
              className="user-menu-item w-full text-left text-red-300 hover:text-red-200"
              onClick={() => {
                close();
                void signOut({ callbackUrl: "/connexion" });
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Déconnexion
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
