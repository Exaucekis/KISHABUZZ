import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "arena" | "ghost";
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", className }: Props) {
  const base =
    "btn-interactive inline-flex max-w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-center text-sm font-bold tracking-wide focus-ring";

  const variants = {
    primary: "bg-ember text-on-ember shadow-md hover:bg-ember-hot",
    secondary:
      "border-2 border-ink-contrast bg-transparent text-paper hover:bg-ink-3 hover:border-ember-text",
    arena: "border-2 border-ember bg-ember text-on-ember hover:bg-ember-hot",
    ghost: "text-paper-muted hover:text-paper hover:bg-ink-3",
  };

  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
