import assert from "node:assert/strict";
import { idsMatch, moveIndex, nextOrder, rankedOrders } from "../src/lib/reorder";

assert.deepEqual(moveIndex(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
assert.deepEqual(moveIndex(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
assert.deepEqual(moveIndex(["a", "b", "c"], 1, 1), ["a", "b", "c"]);
assert.deepEqual(moveIndex(["a", "b", "c"], -1, 0), ["a", "b", "c"]);
assert.deepEqual(rankedOrders(["x", "y"]), [
  { id: "x", order: 0 },
  { id: "y", order: 1 },
]);
assert.equal(nextOrder(4), 5);
assert.equal(nextOrder(null), 0);
assert.equal(idsMatch(["a", "b"], ["b", "a"]), true);
assert.equal(idsMatch(["a"], ["a", "b"]), false);
assert.equal(idsMatch(["a", "a"], ["a", "b"]), false);

console.log("reorder tests: ok");
