import assert from "node:assert/strict";
import { articleInlineImageTag, escapeHtmlAttr, imageAlt } from "../src/lib/image-alt";

assert.equal(imageAlt("  Gaz sur scène ", "Titre"), "Gaz sur scène");
assert.equal(imageAlt("  ", "Couverture"), "Couverture");
assert.equal(imageAlt(null, ""), "");
assert.equal(escapeHtmlAttr('a "b" & c'), "a &quot;b&quot; &amp; c");
assert.equal(
  articleInlineImageTag("/uploads/a.jpg", 'Artiste "X"'),
  '<img src="/uploads/a.jpg" alt="Artiste &quot;X&quot;" />'
);

console.log("image alt tests: ok");
