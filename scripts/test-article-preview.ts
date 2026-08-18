import assert from "node:assert/strict";
import {
  articleEditPath,
  articlePreviewPath,
  articlePublicPath,
  isPreviewQuery,
} from "../src/lib/article-paths";

assert.equal(articlePublicPath("CHRONIQUE", "voix-scene"), "/chroniques/voix-scene");
assert.equal(articlePublicPath("ARTICLE", "dossier"), "/publications/dossier");
assert.equal(articlePublicPath("ANALYSIS", "note"), "/publications/note");
assert.equal(articlePreviewPath("CHRONIQUE", "voix-scene"), "/chroniques/voix-scene?preview=1");
assert.equal(articleEditPath("abc"), "/admin/articles/abc");
assert.equal(isPreviewQuery("1"), true);
assert.equal(isPreviewQuery("true"), true);
assert.equal(isPreviewQuery("0"), false);
assert.equal(isPreviewQuery(undefined), false);

console.log("article preview tests: ok");
