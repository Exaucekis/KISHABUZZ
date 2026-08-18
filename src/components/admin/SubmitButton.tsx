"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
  pendingLabel = "Enregistrement…",
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const variantClass =
    variant === "danger"
      ? "admin-btn-danger"
      : variant === "ghost"
        ? "admin-btn-ghost"
        : "admin-btn-primary";

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`admin-btn ${variantClass} disabled:opacity-60 ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
