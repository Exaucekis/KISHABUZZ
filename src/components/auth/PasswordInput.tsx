"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  wrapClassName?: string;
};

export function PasswordInput({ className, wrapClassName, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const fallbackId = useId();
  const id = props.id || fallbackId;

  return (
    <div className={cn("relative", wrapClassName)}>
      <input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        className={cn("w-full pr-12", className)}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-paper-muted transition hover:bg-ink-3 hover:text-paper"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        tabIndex={0}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
