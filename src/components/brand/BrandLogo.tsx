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
  sm: { className: "h-9 w-9 sm:h-10 sm:w-10", px: 40 },
  md: { className: "h-12 w-12 md:h-14 md:w-14", px: 56 },
  lg: { className: "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24", px: 96 },
  hero: {
    className: "h-28 w-28 sm:h-40 sm:w-40 md:h-52 md:w-52 lg:h-60 lg:w-60",
    px: 256,
  },
};

export function BrandLogo({ href = "/", className, size = "md", priority = false }: Props) {
  const s = sizes[size];
  const image = (
    <Image
      src="/brand/kisha-buzz-logo.png"
      alt="KISHA BUZZ — La révolution culturelle et marketing"
      width={s.px}
      height={s.px}
      priority={priority}
      className={cn(s.className, "object-contain", className)}
    />
  );

  if (href === null || href === "") return image;

  return (
    <Link href={href} className="inline-flex shrink-0 focus-ring" aria-label="KISHA BUZZ — Accueil">
      {image}
    </Link>
  );
}
