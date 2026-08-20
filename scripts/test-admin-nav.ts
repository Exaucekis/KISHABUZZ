import assert from "node:assert/strict";
import { ADMIN_NAV, adminNavTitle, isAdminNavActive } from "../src/lib/admin-nav";
import {
  matchesEventListView,
  parseEventEditTab,
  parseEventListView,
} from "../src/lib/event-admin-views";

const dashboard = ADMIN_NAV[0];
const articles = ADMIN_NAV.find((item) => item.href === "/admin/articles")!;
const arena = ADMIN_NAV.find((item) => item.href === "/admin/arena")!;
const albums = ADMIN_NAV.find((item) => item.href === "/admin/arena/albums")!;
const guests = ADMIN_NAV.find((item) => item.href === "/admin/arena/guests")!;
const videos = ADMIN_NAV.find((item) => item.href === "/admin/arena/videos")!;

assert.equal(isAdminNavActive("/admin", dashboard), true);
assert.equal(isAdminNavActive("/admin/articles", dashboard), false);
assert.equal(isAdminNavActive("/admin/articles/abc", articles), true);
assert.equal(isAdminNavActive("/admin/arena", arena), true);
assert.equal(isAdminNavActive("/admin/arena/new", arena), true);
assert.equal(isAdminNavActive("/admin/arena/show1", arena), true);
assert.equal(isAdminNavActive("/admin/arena/emissions", arena), true);
assert.equal(isAdminNavActive("/admin/arena/archives", arena), true);
assert.equal(isAdminNavActive("/admin/arena/alertes", arena), true);
assert.equal(isAdminNavActive("/admin/arena/albums", arena), false);
assert.equal(isAdminNavActive("/admin/arena/videos", arena), false);
assert.equal(isAdminNavActive("/admin/arena/guests", arena), false);
assert.equal(isAdminNavActive("/admin/arena/guests", guests), true);
assert.equal(isAdminNavActive("/admin/arena/videos", videos), true);
assert.equal(isAdminNavActive("/admin/arena/albums/x", albums), true);
assert.equal(adminNavTitle("/admin"), "Tableau de bord");
assert.equal(adminNavTitle("/admin/articles/abc"), "Articles & chroniques");
assert.equal(adminNavTitle("/admin/arena/albums/x"), "Albums photos");
assert.equal(adminNavTitle("/admin/arena/videos"), "Vidéos Arena");
assert.equal(adminNavTitle("/admin/evenements"), "Événements");
assert.equal(adminNavTitle("/admin/evenements/new"), "Événements");
assert.equal(adminNavTitle("/admin/newsletter"), "Newsletter");
assert.equal(
  ADMIN_NAV.every((item) => Boolean(item.group)),
  true
);

assert.equal(parseEventListView(undefined), "en-cours");
assert.equal(parseEventListView("brouillons"), "brouillons");
assert.equal(matchesEventListView("PUBLISHED", "en-cours"), true);
assert.equal(matchesEventListView("DRAFT", "en-cours"), false);
assert.equal(matchesEventListView("ENDED", "passes"), true);
assert.equal(parseEventEditTab(undefined, "PUBLISHED"), "en-cours");
assert.equal(parseEventEditTab(undefined, "DRAFT"), "fiche");

console.log("admin nav tests: ok");
