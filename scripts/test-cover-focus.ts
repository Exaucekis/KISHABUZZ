import assert from "node:assert/strict";
import { coverFocusStyle, formatCoverFocus, normalizeCoverFocus, parseCoverFocus } from "../src/lib/cover-focus";

assert.deepEqual(parseCoverFocus("48% 22%"), { x: 48, y: 22 });
assert.deepEqual(parseCoverFocus("10 90"), { x: 10, y: 90 });
assert.deepEqual(parseCoverFocus(""), { x: 50, y: 50 });
assert.deepEqual(parseCoverFocus("200% -10%"), { x: 100, y: 0 });
assert.equal(formatCoverFocus(33.4, 71.8), "33% 72%");
assert.equal(normalizeCoverFocus(" 20%  80% "), "20% 80%");
assert.equal(coverFocusStyle("20% 80%").objectPosition, "20% 80%");

console.log("cover focus tests: ok");
