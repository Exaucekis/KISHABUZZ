import assert from "node:assert/strict";
import {
  classifyLibraryUrl,
  filterLibraryItems,
  mergeLibraryItems,
} from "../src/lib/library";

const merged = mergeLibraryItems([
  { url: "/uploads/a.jpg", kind: "IMAGE", title: "Une", createdAt: 1 },
  { url: "/uploads/a.jpg", kind: "IMAGE", title: "Doublon", createdAt: 9 },
  { url: "https://youtu.be/abcdefghijk", kind: "VIDEO", title: "Live", createdAt: 5 },
  { url: "  ", kind: "IMAGE", title: "vide", createdAt: 2 },
]);

assert.equal(merged.length, 2);
assert.equal(merged[0].url, "https://youtu.be/abcdefghijk");
assert.equal(merged[1].title, "Une");
assert.equal(classifyLibraryUrl("/uploads/clip.mp4"), "VIDEO");
assert.equal(classifyLibraryUrl("/uploads/cover.webp"), "IMAGE");
assert.equal(filterLibraryItems(merged, "image").length, 1);
assert.equal(filterLibraryItems(merged, "video").length, 1);

console.log("library tests: ok");
