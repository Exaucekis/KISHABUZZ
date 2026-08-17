"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "menu" | "page";
  onBeforeOpen?: () => void;
};

export function SignOutButton({ className, variant = "page", onBeforeOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  const confirmSignOut = () => {
    startSignOut(async () => {
      await signOutAction();
    });
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          variant === "page"
            ? "inline-flex items-center gap-2 rounded-lg border border-line/80 bg-ink-2/80 px-5 py-3 text-sm font-bold uppercase tracking-wide text-paper transition hover:border-red-400/35 hover:bg-red-500/10 hover:text-red-200"
            : "user-menu-item group user-menu-item--danger w-full",
          className
        )}
        onClick={() => {
          onBeforeOpen?.();
          setOpen(true);
        }}
      >
        {variant === "menu" ? (
          <>
            <span className="user-menu-icon user-menu-icon--danger">
              <LogOut className="h-4 w-4" aria-hidden />
            </span>
            <span className="flex-1 text-left">
              <span className="block">Déconnexion</span>
              <span className="block text-[0.72rem] font-normal text-red-200/70">Quitter la session</span>
            </span>
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4" aria-hidden />
            Déconnexion
          </>
        )}
      </button>

      <ConfirmDialog
        open={open}
        title="Se déconnecter ?"
        description="Vous quitterez votre session KISHA BUZZ. Vous pourrez vous reconnecter à tout moment avec votre email et mot de passe."
        confirmLabel="Oui, me déconnecter"
        cancelLabel="Rester connecté"
        loading={signingOut}
        variant="danger"
        onCancel={() => {
          if (!signingOut) setOpen(false);
        }}
        onConfirm={confirmSignOut}
      />
    </>
  );
}
