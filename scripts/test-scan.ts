import assert from "node:assert/strict";
import { classifyTicketScan, scanResultLabel } from "../src/lib/ticket-scan-core";

assert.equal(scanResultLabel("OK"), "Entrée validée");
assert.equal(
  classifyTicketScan({
    ticket: { eventId: "e1", status: "VALID", orderStatus: "PAID" },
    eventId: "e1",
    signatureOk: true,
  }),
  "OK"
);
assert.equal(
  classifyTicketScan({
    ticket: { eventId: "e1", status: "USED", orderStatus: "PAID" },
    eventId: "e1",
    signatureOk: true,
  }),
  "ALREADY_USED"
);
assert.equal(
  classifyTicketScan({
    ticket: { eventId: "e1", status: "VALID", orderStatus: "PAID" },
    eventId: "e2",
    signatureOk: true,
  }),
  "WRONG_EVENT"
);
assert.equal(
  classifyTicketScan({
    ticket: { eventId: "e1", status: "VALID", orderStatus: "AWAITING_PAYMENT" },
    eventId: "e1",
    signatureOk: true,
  }),
  "UNPAID"
);
assert.equal(
  classifyTicketScan({
    ticket: { eventId: "e1", status: "VALID", orderStatus: "PAID" },
    eventId: "e1",
    signatureOk: false,
  }),
  "INVALID"
);
assert.equal(classifyTicketScan({ ticket: null, eventId: "e1", signatureOk: null }), "INVALID");

assert.equal(
  classifyTicketScan({
    ticket: { eventId: "e1", status: "CANCELLED", orderStatus: "PAID" },
    eventId: "e1",
    signatureOk: true,
  }),
  "CANCELLED"
);
assert.equal(
  classifyTicketScan({
    ticket: { eventId: "e1", status: "REFUNDED", orderStatus: "REFUNDED" },
    eventId: "e1",
    signatureOk: true,
  }),
  "REFUNDED"
);

console.log("scan tests: ok");
