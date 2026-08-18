import { formatMoney } from "@/lib/events";

export function OrganizerKpis({
  capacity,
  sold,
  reserved,
  remaining,
  fillLabel,
  scanned,
  scanRate,
  revenue,
  currency,
}: {
  capacity: number;
  sold: number;
  reserved: number;
  remaining: number;
  fillLabel: string;
  scanned: number;
  scanRate: number;
  revenue: number;
  currency: string;
}) {
  const items = [
    { label: "Capacité", value: String(capacity) },
    { label: "Vendus", value: String(sold) },
    { label: "Réservés", value: String(reserved) },
    { label: "Restants", value: String(remaining) },
    { label: "Utilisés", value: `${scanned} · ${scanRate} %` },
    { label: "Remplissage", value: fillLabel },
    { label: "CA encaissé", value: formatMoney(revenue, currency) },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border border-line bg-ink-2 px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-paper-muted">{item.label}</p>
          <p className="mt-2 font-display text-2xl tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
