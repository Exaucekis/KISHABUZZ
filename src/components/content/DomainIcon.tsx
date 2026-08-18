import { isImageSrc } from "@/lib/media";

export function DomainIcon({
  icon,
  name,
  size = "md",
}: {
  icon?: string | null;
  name?: string;
  size?: "sm" | "md";
}) {
  if (!icon?.trim()) return null;
  const cls = size === "sm" ? "h-5 w-5" : "h-8 w-8";

  if (isImageSrc(icon)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={icon} alt="" className={`${cls} shrink-0 object-contain`} />
    );
  }

  return (
    <span className={size === "sm" ? "text-base" : "text-2xl"} aria-hidden title={name}>
      {icon}
    </span>
  );
}
