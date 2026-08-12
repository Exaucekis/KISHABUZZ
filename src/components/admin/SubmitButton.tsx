"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
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
      disabled={pending}
      className={`admin-btn ${variantClass} disabled:opacity-60 ${className}`}
    >
      {pending ? "Enregistrement…" : children}
    </button>
  );
}
