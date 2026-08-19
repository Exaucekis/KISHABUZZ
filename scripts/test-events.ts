import assert from "node:assert/strict";
import {
  convertReservationOutcome,
  eventOnSale,
  formatMoney,
  isCinetPayAmount,
  remainingSeats,
  RESERVATION_MINUTES,
  ticketTypeOnSale,
  totalRemaining,
} from "../src/lib/events";
import { boxOfficeClosesAt, paidSessions, ticketTypeHasLiveDay } from "../src/lib/event-schedule";
import { eventCapacityError, ticketQuantityFloorError } from "../src/lib/event-capacity";

assert.equal(remainingSeats({ quantity: 100, soldCount: 40, reservedCount: 10 }), 50);
assert.equal(remainingSeats({ quantity: 10, soldCount: 10, reservedCount: 0 }), 0);
assert.equal(remainingSeats({ quantity: 5, soldCount: 4, reservedCount: 2 }), 0);
assert.equal(
  totalRemaining([
    { quantity: 10, soldCount: 2, reservedCount: 1 },
    { quantity: 5, soldCount: 5, reservedCount: 0 },
  ]),
  7
);
assert.equal(isCinetPayAmount(5000), true);
assert.equal(isCinetPayAmount(7), false);
assert.equal(formatMoney(15000, "CDF"), "15 000 CDF");
assert.equal(
  eventOnSale({
    status: "PUBLISHED",
    startsAt: new Date("2030-01-01T18:00:00.000Z"),
    salesOpensAt: null,
    salesClosesAt: null,
  }),
  true
);
assert.equal(
  eventOnSale({
    status: "PUBLISHED",
    startsAt: new Date("2020-01-01T18:00:00.000Z"),
    endsAt: new Date("2030-01-03T22:00:00.000Z"),
    salesOpensAt: null,
    salesClosesAt: null,
  }),
  true
);
assert.equal(
  eventOnSale({
    status: "PUBLISHED",
    startsAt: new Date("2020-01-01T18:00:00.000Z"),
    endsAt: new Date("2020-01-03T22:00:00.000Z"),
    salesOpensAt: null,
    salesClosesAt: null,
  }),
  false
);
assert.equal(
  eventOnSale({
    status: "DRAFT",
    startsAt: new Date("2030-01-01T18:00:00.000Z"),
  }),
  false
);
assert.equal(ticketTypeOnSale({ visible: true }), true);
assert.equal(ticketTypeOnSale({ visible: false }), false);

assert.equal(
  eventCapacityError({ capacity: 0, status: "DRAFT", quantities: [100, 200] }),
  null
);
assert.equal(
  eventCapacityError({ capacity: 0, status: "PUBLISHED", quantities: [100] })?.includes("capacité"),
  true
);
assert.equal(
  eventCapacityError({ capacity: 1000, status: "PUBLISHED", quantities: [100, 700, 200] }),
  null
);
assert.equal(
  eventCapacityError({ capacity: 1000, status: "PUBLISHED", quantities: [200, 900] })?.includes("dépasse"),
  true
);
assert.equal(
  eventCapacityError({ capacity: 50, status: "DRAFT", quantities: [10], takenSeats: 80 })?.includes("80"),
  true
);
assert.equal(ticketQuantityFloorError("VIP", 10, 8, 3)?.includes("11"), true);
assert.equal(ticketQuantityFloorError("VIP", 12, 8, 3), null);

assert.equal(convertReservationOutcome(4, 0, 4), "reserved");
assert.equal(convertReservationOutcome(0, 4, 4), "stock");
assert.equal(convertReservationOutcome(0, 2, 4), "failed");
assert.equal(RESERVATION_MINUTES, 10);

const monday = new Date("2030-01-07T18:00:00.000Z");
const friday = new Date("2030-01-11T18:00:00.000Z");
const sundayFree = new Date("2030-01-13T14:00:00.000Z");
const days = [
  { id: "mon", startsAt: monday, endsAt: new Date("2030-01-07T22:00:00.000Z"), access: "PAID" },
  { id: "fri", startsAt: friday, endsAt: new Date("2030-01-11T22:00:00.000Z"), access: "PAID" },
  { id: "sun", startsAt: sundayFree, endsAt: new Date("2030-01-13T20:00:00.000Z"), access: "FREE" },
];
assert.equal(paidSessions(days).length, 2);
assert.equal(
  eventOnSale({
    status: "PUBLISHED",
    startsAt: monday,
    sessions: days,
    salesOpensAt: null,
    salesClosesAt: null,
  }),
  true
);
assert.equal(
  eventOnSale({
    status: "PUBLISHED",
    startsAt: monday,
    sessions: days.filter((day) => day.access === "FREE"),
    salesOpensAt: null,
    salesClosesAt: null,
  }),
  false
);
assert.equal(ticketTypeHasLiveDay(days, ["fri"], new Date("2030-01-10T12:00:00.000Z")), true);
assert.equal(ticketTypeHasLiveDay(days, ["mon"], new Date("2030-01-10T12:00:00.000Z")), false);
assert.ok(boxOfficeClosesAt({ startsAt: monday, sessions: days }) > friday);

console.log("events tests: ok");
