import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  arenaShowPlace,
  arenaTicketCta,
  compareArenaDates,
  isUpcomingArenaDate,
} from "../src/lib/arena-calendar";

assert.equal(isUpcomingArenaDate({ status: "DRAFT", airDate: new Date("2099-01-01") }), false);
assert.equal(isUpcomingArenaDate({ status: "ARCHIVED", airDate: new Date("2099-01-01") }), false);
assert.equal(isUpcomingArenaDate({ status: "SCHEDULED", airDate: null }), true);
assert.equal(isUpcomingArenaDate({ status: "PUBLISHED", airDate: null }), false);
assert.equal(
  isUpcomingArenaDate({ status: "SCHEDULED", airDate: new Date("2020-01-01") }, new Date("2026-08-20")),
  false
);
assert.equal(
  isUpcomingArenaDate({ status: "PUBLISHED", airDate: new Date("2026-08-20") }, new Date("2026-08-20T18:00:00")),
  true
);

const sorted = [
  { airDate: new Date("2026-09-02"), number: 2 },
  { airDate: null, number: 9 },
  { airDate: new Date("2026-08-21"), number: 1 },
].sort(compareArenaDates);
assert.equal(sorted[0].number, 1);
assert.equal(sorted[1].number, 2);
assert.equal(sorted[2].number, 9);

assert.equal(arenaShowPlace({ venueName: "Studio Arena" }, { venueName: "Autre", city: "Lubumbashi" }), "Studio Arena");
assert.equal(arenaShowPlace({ venueName: "" }, { venueName: "Halle de l’Unité", city: "Lubumbashi" }), "Halle de l’Unité · Lubumbashi");
assert.equal(arenaShowPlace({ venueName: "  " }, null), "");

assert.equal(arenaTicketCta(null), null);
assert.equal(
  arenaTicketCta({
    slug: "soir",
    status: "DRAFT",
    venueName: "",
    city: "",
    address: "",
    sessions: [],
    ticketTypes: [],
  }),
  null
);
assert.deepEqual(
  arenaTicketCta({
    slug: "soir",
    status: "PUBLISHED",
    venueName: "",
    city: "",
    address: "",
    sessions: [{ access: "PAID", startsAt: new Date(), endsAt: null }],
    ticketTypes: [{ quantity: 100, soldCount: 2, reservedCount: 0, visible: true }],
  }),
  { href: "/evenements/soir", label: "Prendre un billet", kind: "paid" }
);
assert.equal(
  arenaTicketCta({
    slug: "soir",
    status: "SOLD_OUT",
    venueName: "",
    city: "",
    address: "",
    sessions: [{ access: "PAID", startsAt: new Date(), endsAt: null }],
    ticketTypes: [{ quantity: 10, soldCount: 10, reservedCount: 0, visible: true }],
  })?.kind,
  "soldout"
);
assert.equal(
  arenaTicketCta({
    slug: "libre",
    status: "PUBLISHED",
    venueName: "",
    city: "",
    address: "",
    sessions: [{ access: "FREE", startsAt: new Date(), endsAt: null }],
    ticketTypes: [],
  })?.kind,
  "free"
);

assert.equal(existsSync("src/app/(site)/arena-culture/calendrier/page.tsx"), true);
assert.equal(existsSync("src/components/arena/ArenaCalendarCard.tsx"), true);

console.log("arena calendar tests: ok");
