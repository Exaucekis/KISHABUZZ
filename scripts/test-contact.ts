import assert from "node:assert/strict";
import { PUBLIC_CONTACT_EMAIL, resolveContactInbox, withPublicContactEmail } from "../src/lib/contact";

assert.equal(PUBLIC_CONTACT_EMAIL, "contact@kisha-buzz.com");
assert.equal(resolveContactInbox(""), "contact@kisha-buzz.com");
assert.equal(resolveContactInbox("  hello@kisha-buzz.com "), "hello@kisha-buzz.com");
assert.equal(withPublicContactEmail({ email: "" }).email, "contact@kisha-buzz.com");
assert.equal(withPublicContactEmail({ email: "a@b.cd" }).email, "a@b.cd");

const previous = process.env.CONTACT_INBOX;
process.env.CONTACT_INBOX = "autre@kisha-buzz.com";
assert.equal(resolveContactInbox("ignored@kisha-buzz.com"), "autre@kisha-buzz.com");
if (previous === undefined) delete process.env.CONTACT_INBOX;
else process.env.CONTACT_INBOX = previous;

console.log("contact inbox tests: ok");
