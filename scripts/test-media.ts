import assert from "node:assert/strict";
import { videoPoster } from "../src/lib/media";

assert.equal(videoPoster("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
assert.equal(
  videoPoster("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "/custom.jpg"),
  "/custom.jpg"
);
assert.equal(videoPoster("/arena/videos/kishabuzz.mp4"), "");
assert.equal(videoPoster("/arena/videos/kishabuzz.mp4", "https://img.example/p.jpg"), "https://img.example/p.jpg");

console.log("media poster tests: ok");
