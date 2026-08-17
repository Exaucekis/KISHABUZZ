export function DomainMarquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <div className="marquee border-y border-line bg-ink-3 py-3 sm:py-4" aria-hidden>
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
