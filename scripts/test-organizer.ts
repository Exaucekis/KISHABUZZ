import assert from "node:assert/strict";
import { fillPercent, fillPercentDecimal, formatFillPercent, paidRevenue, sharePercent, summarizeOrganizerEvent } from "../src/lib/organizer-stats";

assert.equal(fillPercent(50, 100), 50);
assert.equal(fillPercent(0, 0), 0);
assert.equal(fillPercent(12, 10), 100);
assert.equal(sharePercent(25, 100), 25);
assert.equal(paidRevenue([{ ticketTypeId: "a", quantity: 2, unitPrice: 5000 }]), 10000);

const summary = summarizeOrganizerEvent(
  [
    { id: "vip", name: "VIP", quantity: 10, soldCount: 4, reservedCount: 1, price: 20000 },
    { id: "std", name: "Standard", quantity: 40, soldCount: 16, reservedCount: 0, price: 5000 },
  ],
  [
    { ticketTypeId: "vip", quantity: 4, unitPrice: 20000 },
    { ticketTypeId: "std", quantity: 16, unitPrice: 5000 },
  ],
  5
);

assert.equal(summary.sold, 20);
assert.equal(summary.reserved, 1);
assert.equal(summary.remaining, 29);
assert.equal(summary.capacity, 50);
assert.equal(summary.fill, 40);
assert.equal(summary.fillDecimal, 40);
assert.equal(summary.scanned, 5);
assert.equal(summary.used, 5);
assert.equal(summary.scanRate, 25);
assert.equal(summary.revenue, 160000);
assert.equal(summary.types[0].revenue, 80000);
assert.equal(summary.types[0].share, 20);
assert.equal(fillPercentDecimal(643, 1000), 64.3);
assert.equal(formatFillPercent(643, 1000), "64,3 %");

console.log("organizer tests: ok");
