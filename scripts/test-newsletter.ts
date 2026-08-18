import assert from "node:assert/strict";
import {
  csvEscape,
  isNewsletterEmail,
  normalizeNewsletterEmail,
  subscribersToCsv,
} from "../src/lib/newsletter";

assert.equal(normalizeNewsletterEmail("  A@B.CD "), "a@b.cd");
assert.equal(isNewsletterEmail("nom@kishabuzz.com"), true);
assert.equal(isNewsletterEmail("pas-un-email"), false);
assert.equal(csvEscape('a "b"'), '"a ""b"""');
assert.equal(
  subscribersToCsv([
    { email: "a@b.cd", status: "ACTIVE", createdAt: "2026-08-18T00:00:00.000Z" },
  ]).includes("a@b.cd,ACTIVE,2026-08-18T00:00:00.000Z"),
  true
);

console.log("newsletter tests: ok");
