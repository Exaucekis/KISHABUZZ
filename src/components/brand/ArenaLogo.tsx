import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
  priority?: boolean;
};

const sizes = {
  sm: { className: "h-8 w-auto max-w-[120px]", width: 120, height: 40 },
  md: { className: "h-11 w-auto max-w-[160px] sm:h-12", width: 160, height: 52 },
  lg: { className: "h-14 w-auto max-w-[200px] sm:h-16", width: 200, height: 70 },
  hero: {
    className: "h-12 w-auto max-w-[160px] sm:h-14",
    width: 160,
    height: 52,
  },
};

/** Logo ARENA CULTURE — uniquement pour l'espace /arena-culture */
export function ArenaLogo({ href = "/arena-culture", className, size = "md", priority = false }: Props) {
  const s = sizes[size];
  const image = (
    <Image
      src="/brand/arena-culture-logo.png"
      alt="Arena Culture"
      width={s.width}
      height={s.height}
      priority={priority}
      className={cn(s.className, "object-contain", className)}
    />
  );

  if (href === null || href === "") return image;

  return (
    <Link href={href} className="inline-flex shrink-0 focus-ring" aria-label="Arena Culture — Accueil">
      {image}
    </Link>
  );
}
