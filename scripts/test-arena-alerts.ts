import assert from "node:assert/strict";
import {
  arenaAlertKindFromStatus,
  arenaAlertWhenLine,
  buildArenaAlertCopy,
  buildArenaAlertWhatsAppText,
  parseArenaAlertSignup,
  shouldDispatchArenaAlert,
} from "../src/lib/arena-alerts";
import { isValidWhatsAppPhone, toWhatsAppPhone, formatWhatsAppDisplay } from "../src/lib/phone";
import { isWhatsAppConfigured, whatsappSetupHint } from "../src/lib/whatsapp";

assert.equal(arenaAlertKindFromStatus("SCHEDULED"), "ANNOUNCE");
assert.equal(arenaAlertKindFromStatus("PUBLISHED"), "HEADLINE");
assert.equal(arenaAlertKindFromStatus("DRAFT"), null);

assert.equal(shouldDispatchArenaAlert("DRAFT", "SCHEDULED"), true);
assert.equal(shouldDispatchArenaAlert("SCHEDULED", "PUBLISHED"), true);
assert.equal(shouldDispatchArenaAlert("PUBLISHED", "PUBLISHED"), false);
assert.equal(shouldDispatchArenaAlert(null, "PUBLISHED"), true);
assert.equal(shouldDispatchArenaAlert("DRAFT", "ARCHIVED"), false);
assert.equal(shouldDispatchArenaAlert("PUBLISHED", "ARCHIVED"), false);

const emailOnly = parseArenaAlertSignup({ email: "  Fan@KISHA.cd ", whatsapp: "" });
assert.equal(emailOnly.email, "fan@kisha.cd");
assert.equal(emailOnly.whatsapp, "");
assert.deepEqual(emailOnly.errors, []);

const waOnly = parseArenaAlertSignup({ email: "", whatsapp: "0974 105 940" });
assert.equal(waOnly.whatsapp, "243974105940");
assert.deepEqual(waOnly.errors, []);

const both = parseArenaAlertSignup({ email: "a@b.cd", whatsapp: "+243 974 105 940" });
assert.equal(both.email, "a@b.cd");
assert.equal(both.whatsapp, "243974105940");

const none = parseArenaAlertSignup({ email: "", whatsapp: "" });
assert.equal(none.errors.length > 0, true);

const bad = parseArenaAlertSignup({ email: "pas-mail", whatsapp: "12" });
assert.equal(bad.errors.length >= 1, true);

assert.equal(isValidWhatsAppPhone("0974105940"), true);
assert.equal(isValidWhatsAppPhone("12"), false);
assert.equal(toWhatsAppPhone("0974105940"), "243974105940");
assert.equal(formatWhatsAppDisplay("0974105940"), "+243 974 105 940");

const copy = buildArenaAlertCopy(
  {
    title: "Arena Live",
    slug: "arena-live",
    theme: "Musique",
    airDate: new Date("2026-08-22T18:00:00.000Z"),
    airTime: "20:00",
    venueName: "Studio Arena",
    guests: [{ guest: { name: "Fally Ipupa" } }],
  },
  "ANNOUNCE"
);
assert.equal(copy.subject.includes("Fally Ipupa"), true);
assert.equal(copy.body.includes("Studio Arena"), true);
assert.equal(copy.url.includes("/arena-culture/emissions/arena-live"), true);
assert.equal(arenaAlertWhenLine({ title: "x", slug: "x", airTime: "20:00" }).includes("20:00"), true);

const waText = buildArenaAlertWhatsAppText(copy, "https://example.com/out");
assert.equal(waText.includes("Se désinscrire"), true);

const previousToken = process.env.WHATSAPP_TOKEN;
const previousPhone = process.env.WHATSAPP_PHONE_NUMBER_ID;
delete process.env.WHATSAPP_TOKEN;
delete process.env.WHATSAPP_PHONE_NUMBER_ID;
assert.equal(isWhatsAppConfigured(), false);
assert.equal(whatsappSetupHint().includes("WHATSAPP_TOKEN"), true);
if (previousToken !== undefined) process.env.WHATSAPP_TOKEN = previousToken;
if (previousPhone !== undefined) process.env.WHATSAPP_PHONE_NUMBER_ID = previousPhone;

console.log("arena alerts tests: ok");
