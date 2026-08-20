import assert from "node:assert/strict";
import {
  arenaSpotlightMode,
  planArenaSpotlight,
} from "../src/lib/arena-spotlight";

const rows = [
  { id: "old", status: "PUBLISHED", isFeatured: true, isGuestOfWeek: false },
  { id: "guest", status: "SCHEDULED", isFeatured: false, isGuestOfWeek: true },
  { id: "other", status: "PUBLISHED", isFeatured: false, isGuestOfWeek: false },
  { id: "next", status: "DRAFT", isFeatured: false, isGuestOfWeek: false },
];

const announced = planArenaSpotlight(rows, "next", "SCHEDULED");
assert.equal(announced.find((row) => row.id === "next")?.isFeatured, false);
assert.equal(announced.find((row) => row.id === "next")?.isGuestOfWeek, true);
assert.equal(announced.find((row) => row.id === "next")?.status, "SCHEDULED");
assert.equal(announced.find((row) => row.id === "old")?.status, "PUBLISHED");
assert.equal(announced.find((row) => row.id === "old")?.isFeatured, true);
assert.equal(announced.find((row) => row.id === "guest")?.status, "ARCHIVED");
assert.equal(announced.find((row) => row.id === "guest")?.isGuestOfWeek, false);
assert.equal(announced.find((row) => row.id === "other")?.status, "PUBLISHED");

const withClip = [
  ...announced,
  { id: "clip", status: "DRAFT", isFeatured: false, isGuestOfWeek: false },
];
const published = planArenaSpotlight(withClip, "clip", "PUBLISHED");
assert.equal(published.find((row) => row.id === "clip")?.status, "PUBLISHED");
assert.equal(published.find((row) => row.id === "clip")?.isFeatured, true);
assert.equal(published.find((row) => row.id === "clip")?.isGuestOfWeek, false);
assert.equal(published.find((row) => row.id === "old")?.status, "ARCHIVED");
assert.equal(published.find((row) => row.id === "old")?.isFeatured, false);
assert.equal(published.find((row) => row.id === "next")?.status, "SCHEDULED");
assert.equal(published.find((row) => row.id === "next")?.isGuestOfWeek, true);

const fromGuest = planArenaSpotlight(rows, "old", "PUBLISHED");
assert.equal(fromGuest.find((row) => row.id === "old")?.isGuestOfWeek, false);
assert.equal(fromGuest.find((row) => row.id === "guest")?.isGuestOfWeek, true);

const draft = planArenaSpotlight(published, "clip", "DRAFT");
assert.equal(draft.find((row) => row.id === "clip")?.isFeatured, false);
assert.equal(draft.find((row) => row.id === "old")?.status, "ARCHIVED");

assert.equal(arenaSpotlightMode(null), "empty");
assert.equal(arenaSpotlightMode({ status: "SCHEDULED", videoUrl: "" }), "announced");
assert.equal(
  arenaSpotlightMode({
    status: "PUBLISHED",
    videoUrl: "https://youtu.be/abc",
    airDate: new Date("2020-01-01"),
  }),
  "headline"
);
assert.equal(
  arenaSpotlightMode({
    status: "PUBLISHED",
    videoUrl: "",
    airDate: new Date("2035-01-01"),
  }),
  "announced"
);

console.log("arena spotlight tests: ok");
