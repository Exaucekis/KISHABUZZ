import assert from "node:assert/strict";
import { buildTicketPdf } from "../src/lib/ticket-pdf";
import { parseTicketQrPayload, verifyTicketSignature } from "../src/lib/ticket-qr";

async function main() {
  const json = parseTicketQrPayload(JSON.stringify({ v: 1, c: "KB-TCK-ABCD2345", s: "ab".repeat(32) }));
  assert.equal(json.publicCode, "KB-TCK-ABCD2345");
  assert.equal(json.signature.length, 64);

  const pdf = await buildTicketPdf({
    publicCode: "KB-TCK-ABCD2345",
    holderName: "Test User",
    eventTitle: "Concert Arena Culture",
    startsAt: new Date("2026-09-01T18:00:00.000Z"),
    venueName: "Halle de la Gombe",
    city: "Kinshasa",
    ticketType: "VIP",
    orderNumber: "KB-20260818-A3F9",
    amount: 15000,
    currency: "CDF",
  });

  assert.ok(pdf.byteLength > 1000);
  assert.equal(pdf[0], 0x25);

  assert.equal(verifyTicketSignature("KB-TCK-ABCD2345", "00".repeat(32), "secret"), false);

  console.log("ticket qr/pdf tests: ok");
}

main();
