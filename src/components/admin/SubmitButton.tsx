"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
  pendingLabel = "Enregistrement…",
  disabled = false,
  name,
  value,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
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
      name={name}
      value={value}
      disabled={pending || disabled}
      className={`admin-btn ${variantClass} disabled:opacity-60 ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
