"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const EMAIL_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[A-Za-z]{2,}$";
export const EMAIL_HINT = "Entrez un email valide, ex. nom@domaine.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim());
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  showHint?: boolean;
};

export function EmailInput({ className, showHint = true, onBlur, onInput, ...props }: Props) {
  const fallbackId = useId();
  const id = props.id || fallbackId;
  const [hint, setHint] = useState("");

  return (
    <>
      <input
        {...props}
        id={id}
        type="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        pattern={EMAIL_PATTERN}
        title={EMAIL_HINT}
        className={cn("w-full", className)}
        onInput={(e) => {
          e.currentTarget.setCustomValidity("");
          const value = e.currentTarget.value.trim();
          setHint(value && !isValidEmail(value) ? EMAIL_HINT : "");
          onInput?.(e);
        }}
        onBlur={(e) => {
          const value = e.currentTarget.value.trim();
          if (value && !isValidEmail(value)) {
            e.currentTarget.setCustomValidity(EMAIL_HINT);
            setHint(EMAIL_HINT);
          } else {
            e.currentTarget.setCustomValidity("");
            setHint("");
          }
          onBlur?.(e);
        }}
        onInvalid={(e) => {
          e.currentTarget.setCustomValidity(EMAIL_HINT);
        }}
      />
      {showHint && hint ? <p className="mt-1 text-sm text-red-400">{hint}</p> : null}
    </>
  );
}
