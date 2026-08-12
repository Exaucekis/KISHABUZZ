"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "btn-interactive inline-flex items-center gap-2 rounded-md border border-line bg-ink-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-paper",
        className
      )}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 shrink-0 text-[#c6ff00]" />
      ) : (
        <Moon className="h-4 w-4 shrink-0 text-ember-text" />
      )}
      <span className="hidden md:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
