import { remainingSeats } from "@/lib/events";

export type OrganizerTypeInput = {
  id: string;
  name: string;
  quantity: number;
  soldCount: number;
  reservedCount: number;
  price: number;
};

export type PaidItemInput = {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
};

export function fillPercent(sold: number, capacity: number) {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((sold / capacity) * 100)));
}

export function fillPercentDecimal(sold: number, capacity: number) {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((sold / capacity) * 1000) / 10));
}

export function formatFillPercent(sold: number, capacity: number) {
  return `${fillPercentDecimal(sold, capacity).toFixed(1).replace(".", ",")} %`;
}

export function sharePercent(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}

export function paidRevenue(items: PaidItemInput[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function summarizeOrganizerEvent(
  types: OrganizerTypeInput[],
  paidItems: PaidItemInput[],
  scannedCount: number,
  eventCapacity = 0
) {
  const sold = types.reduce((sum, type) => sum + type.soldCount, 0);
  const reserved = types.reduce((sum, type) => sum + type.reservedCount, 0);
  const remaining = types.reduce((sum, type) => sum + remainingSeats(type), 0);
  const stockCapacity = types.reduce((sum, type) => sum + type.quantity, 0);
  const capacity = eventCapacity > 0 ? eventCapacity : stockCapacity;
  const revenue = paidRevenue(paidItems);
  const revenueByType = new Map<string, number>();
  for (const item of paidItems) {
    revenueByType.set(item.ticketTypeId, (revenueByType.get(item.ticketTypeId) || 0) + item.quantity * item.unitPrice);
  }

  return {
    sold,
    reserved,
    remaining,
    capacity,
    fill: fillPercent(sold, capacity),
    fillDecimal: fillPercentDecimal(sold, capacity),
    scanned: scannedCount,
    used: scannedCount,
    scanRate: fillPercent(scannedCount, sold),
    revenue,
    types: types.map((type) => ({
      ...type,
      remaining: remainingSeats(type),
      share: sharePercent(type.soldCount, sold),
      revenue: revenueByType.get(type.id) || 0,
    })),
  };
}
