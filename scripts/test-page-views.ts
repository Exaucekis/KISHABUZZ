import assert from "node:assert/strict";
import { formatViews, isBotUserAgent, viewStorageKey } from "../src/lib/page-views";

assert.equal(formatViews(0), "0 vue");
assert.equal(formatViews(1), "1 vue");
assert.equal(formatViews(12), "12 vues");
assert.equal(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)"), true);
assert.equal(isBotUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"), false);
assert.equal(viewStorageKey("article", "abc"), "kb-view:article:abc");

console.log("page views tests: ok");
