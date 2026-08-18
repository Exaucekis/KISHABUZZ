import assert from "node:assert/strict";
import {
  amountsMatch,
  mapCinetPayStatus,
  parseCinetPayNotifyBody,
  sanitizeCinetPayText,
} from "../src/lib/cinetpay";
import { isCinetPayAmount, ticketTypeOnSale } from "../src/lib/events";
import { isValidBuyerPhone, toCinetPayPhone } from "../src/lib/phone";
import { generateOrderNumber, generateTransactionId, isOrderNumber, isPublicCode, isTransactionId } from "../src/lib/ticket-codes";
import { parseTicketQrPayload, signTicketCode, ticketQrPayload, verifyTicketSignature } from "../src/lib/ticket-qr";

assert.equal(sanitizeCinetPayText("Billets #VIP / $test_&"), "Billets VIP test");
assert.equal(mapCinetPayStatus("accepted"), "ACCEPTED");
assert.equal(mapCinetPayStatus("CANCELED"), "CANCELLED");
assert.equal(mapCinetPayStatus("WAITING_FOR_CUSTOMER"), "PENDING");
assert.equal(amountsMatch({ amount: 5000, currency: "CDF" }, { amount: 5000, currency: "cdf" }), true);
assert.equal(amountsMatch({ amount: 5000, currency: "CDF" }, { amount: 4995, currency: "CDF" }), false);

const form = parseCinetPayNotifyBody(
  "application/x-www-form-urlencoded",
  "cpm_site_id=123&cpm_trans_id=KBABCDEFGHJKMNPQRS"
);
assert.equal(form.transactionId, "KBABCDEFGHJKMNPQRS");

const json = parseCinetPayNotifyBody("application/json", JSON.stringify({ transaction_id: "KBTESTID" }));
assert.equal(json.transactionId, "KBTESTID");

assert.equal(isValidBuyerPhone("0974105940"), true);
assert.equal(isValidBuyerPhone("12"), false);
assert.equal(toCinetPayPhone("0974105940"), "243974105940");
assert.equal(toCinetPayPhone("+243 974 105 940"), "243974105940");
assert.equal(toCinetPayPhone("974105940"), "243974105940");

const number = generateOrderNumber(new Date("2026-08-18T10:00:00"));
assert.equal(isOrderNumber(number), true);
assert.equal(isTransactionId(generateTransactionId()), true);
assert.equal(isPublicCode("KB-TCK-ABCD2345"), true);
assert.equal(isPublicCode("KB-TCK-bad"), false);

const secret = "test-qr-secret";
const code = "KB-TCK-ABCD2345";
const signature = signTicketCode(code, secret);
assert.equal(verifyTicketSignature(code, signature, secret), true);
assert.equal(verifyTicketSignature(code, "aa".repeat(32), secret), false);
const payload = ticketQrPayload(code, secret);
assert.equal(payload.includes("/s/KB-TCK-ABCD2345"), true);
const parsed = parseTicketQrPayload(payload);
assert.equal(parsed.publicCode, code);
assert.equal(verifyTicketSignature(parsed.publicCode, parsed.signature, secret), true);
assert.equal(isCinetPayAmount(0), true);

assert.equal(
  ticketTypeOnSale({
    visible: true,
    salesOpensAt: new Date("2020-01-01"),
    salesClosesAt: new Date("2030-01-01"),
  }),
  true
);
assert.equal(ticketTypeOnSale({ visible: false }), false);

const reservedUntil = new Date(Date.parse("2026-08-18T10:00:00.000Z") + 10 * 60 * 1000);
assert.equal(reservedUntil.toISOString(), "2026-08-18T10:10:00.000Z");

console.log("orders tests: ok");
