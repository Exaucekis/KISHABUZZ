import assert from "node:assert/strict";
import {
  exactCoverTypes,
  maxGroupSize,
  planTicketCover,
  scaleCover,
} from "../src/lib/ticket-cover";

const monday = { id: "mon", name: "Lundi", price: 10000, remaining: 40, maxPerOrder: 6, sessionIds: ["d1"] };
const friday = { id: "fri", name: "Vendredi", price: 10000, remaining: 40, maxPerOrder: 6, sessionIds: ["d2"] };
const pass = { id: "pass", name: "Pass 2 jours", price: 15000, remaining: 40, maxPerOrder: 6, sessionIds: ["d1", "d2"] };
const vip = { id: "vip", name: "Pass VIP", price: 25000, remaining: 10, maxPerOrder: 4, sessionIds: ["d1", "d2"] };

const both = planTicketCover(["d1", "d2"], [monday, friday, pass, vip]);
assert.equal(both.ok, true);
if (both.ok) {
  assert.equal(both.costPerPerson, 15000);
  assert.equal(both.lines.length, 1);
  assert.equal(both.lines[0].ticketTypeId, "pass");
  assert.equal(scaleCover(both, 3).cost, 45000);
  assert.equal(scaleCover(both, 3).ticketCount, 3);
}

const onlyMonday = planTicketCover(["d1"], [monday, friday, pass]);
assert.equal(onlyMonday.ok, true);
if (onlyMonday.ok) {
  assert.equal(onlyMonday.costPerPerson, 10000);
  assert.equal(onlyMonday.lines[0].ticketTypeId, "mon");
}

const noPass = planTicketCover(["d1", "d2"], [monday, friday]);
assert.equal(noPass.ok, true);
if (noPass.ok) {
  assert.equal(noPass.costPerPerson, 20000);
  assert.equal(noPass.ticketsPerPerson, 2);
}

const freeOnly = planTicketCover([], [monday]);
assert.equal(freeOnly.ok, false);

assert.equal(exactCoverTypes(["d1", "d2"], [monday, friday, pass, vip]).map((row) => row.id).join(","), "pass,vip");
assert.equal(maxGroupSize(both.ok ? both : { ok: true, costPerPerson: 0, extraDays: 0, lines: [], ticketsPerPerson: 0 }, [pass]), 6);

console.log("ticket cover tests: ok");
