import assert from "node:assert/strict";
import {
  campaignNoticeCopy,
  campaignStatusFromCounts,
  csvEscape,
  isNewsletterEmail,
  normalizeNewsletterEmail,
  parseRecipientList,
  subscribersToCsv,
  summarizeRecipients,
} from "../src/lib/newsletter";
import { escapeHtml, textToHtmlParagraphs } from "../src/lib/mail-template";
import { formatFromAddress, isMailerConfigured } from "../src/lib/mailer";

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

const parsed = parseRecipientList("A@B.CD, deux@mail.com; mauvais\ntrois@mail.org");
assert.deepEqual(parsed.emails, ["a@b.cd", "deux@mail.com", "trois@mail.org"]);
assert.deepEqual(parsed.invalid, ["mauvais"]);
assert.equal(summarizeRecipients(["a@b.cd", "c@d.ef"], 12), "a@b.cd, c@d.ef");
assert.equal(campaignStatusFromCounts(3, 0), "SENT");
assert.equal(campaignStatusFromCounts(2, 1), "PARTIAL");
assert.equal(campaignStatusFromCounts(0, 4), "FAILED");
assert.equal(campaignNoticeCopy("NOTICE", "Alerte", 1, 0).title, "Notification envoyée");

assert.equal(escapeHtml('<b>"x"'), "&lt;b&gt;&quot;x&quot;");
assert.equal(textToHtmlParagraphs("Bonjour\n\nKISHA").includes("Bonjour"), true);
assert.equal(formatFromAddress("contact@kishabuzz.com"), "KISHA BUZZ <contact@kishabuzz.com>");
assert.equal(
  formatFromAddress("KISHA BUZZ <hello@kishabuzz.com>"),
  "KISHA BUZZ <hello@kishabuzz.com>"
);

const previousKey = process.env.RESEND_API_KEY;
delete process.env.RESEND_API_KEY;
assert.equal(isMailerConfigured(), false);
if (previousKey !== undefined) process.env.RESEND_API_KEY = previousKey;

console.log("newsletter tests: ok");
