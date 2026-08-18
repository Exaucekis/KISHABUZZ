export function moveIndex<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function rankedOrders(ids: string[]) {
  return ids.map((id, order) => ({ id, order }));
}

export function nextOrder(max: number | null | undefined) {
  return (typeof max === "number" && Number.isFinite(max) ? max : -1) + 1;
}

export function idsMatch(current: string[], expected: string[]) {
  if (current.length !== expected.length) return false;
  const a = [...current].sort();
  const b = [...expected].sort();
  return a.every((id, index) => id === b[index]);
}
