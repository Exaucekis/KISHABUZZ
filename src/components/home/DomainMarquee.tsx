import { DomainIcon } from "@/components/content/DomainIcon";

export type DomainMarqueeItem = {
  name: string;
  icon?: string | null;
};

export function DomainMarquee({ items }: { items: DomainMarqueeItem[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <div className="marquee border-y border-line bg-ink-3 py-3 sm:py-4" aria-hidden>
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={`${item.name}-${i}`} className="marquee-item">
            <DomainIcon icon={item.icon} name={item.name} size="sm" />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
