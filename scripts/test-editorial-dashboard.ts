import assert from "node:assert/strict";
import { articleTypeLabel, editorialHeadline } from "../src/lib/editorial-dashboard";

assert.equal(articleTypeLabel("CHRONIQUE"), "Chronique");
assert.equal(articleTypeLabel("ANALYSIS"), "Analyse");
assert.equal(articleTypeLabel("ARTICLE"), "Publication");

assert.equal(
  editorialHeadline({ drafts: 0, scheduled: 0, contactsNew: 0, arenaDrafts: 0 }),
  "Rien en attente. Le calendrier est à jour."
);
assert.equal(
  editorialHeadline({ drafts: 1, scheduled: 0, contactsNew: 0, arenaDrafts: 0 }),
  "À traiter : 1 brouillon."
);
assert.equal(
  editorialHeadline({ drafts: 2, scheduled: 1, contactsNew: 3, arenaDrafts: 1 }),
  "À traiter : 2 brouillons · 1 programmé · 3 contacts à traiter · 1 émission Arena en brouillon."
);

console.log("editorial dashboard tests: ok");
