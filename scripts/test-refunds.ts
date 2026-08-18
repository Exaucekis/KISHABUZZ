import assert from "node:assert/strict";
import { auditActionLabel } from "../src/lib/event-audit";
import { cancelEventError, refundOrderError, restockByTicketType } from "../src/lib/ticket-refunds";

assert.equal(refundOrderError({ orderStatus: "PAID", alreadyRefunded: false, amount: 5000, reason: "Annulation client" }), null);
assert.equal(
  refundOrderError({ orderStatus: "PENDING", alreadyRefunded: false, amount: 5000, reason: "Annulation client" })?.includes("payée"),
  true
);
assert.equal(
  refundOrderError({ orderStatus: "PAID", alreadyRefunded: true, amount: 5000, reason: "Annulation client" })?.includes("déjà"),
  true
);
assert.equal(
  refundOrderError({ orderStatus: "PAID", alreadyRefunded: false, amount: 5000, reason: "ab" })?.includes("motif"),
  true
);

const restock = restockByTicketType([
  { ticketTypeId: "vip", status: "VALID" },
  { ticketTypeId: "vip", status: "USED" },
  { ticketTypeId: "std", status: "CANCELLED" },
  { ticketTypeId: "std", status: "REFUNDED" },
]);
assert.equal(restock.get("vip"), 1);
assert.equal(restock.get("std"), 1);

assert.equal(cancelEventError("CANCELLED")?.includes("déjà"), true);
assert.equal(cancelEventError("PUBLISHED"), null);
assert.equal(auditActionLabel("ORDER_REFUNDED"), "Remboursement");

console.log("refunds tests: ok");
