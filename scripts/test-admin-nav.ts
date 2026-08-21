import assert from "node:assert/strict";
import { ADMIN_NAV, ARENA_ADMIN_LINKS, adminNavTitle, isAdminNavActive } from "../src/lib/admin-nav";
import { ARENA_NAV, SITE_NAV, SITE_NAV_DESKTOP, SITE_NAV_WITH_ARENA } from "../src/lib/site-structure";
import {
  matchesEventListView,
  parseEventEditTab,
  parseEventListView,
} from "../src/lib/event-admin-views";

const dashboard = ADMIN_NAV[0];
const articles = ADMIN_NAV.find((item) => item.href === "/admin/articles")!;
const arena = ADMIN_NAV.find((item) => item.href === "/admin/arena")!;

assert.equal(isAdminNavActive("/admin", dashboard), true);
assert.equal(isAdminNavActive("/admin/articles", dashboard), false);
assert.equal(isAdminNavActive("/admin/articles/abc", articles), true);
assert.equal(isAdminNavActive("/admin/arena", arena), true);
assert.equal(isAdminNavActive("/admin/arena/new", arena), true);
assert.equal(isAdminNavActive("/admin/arena/show1", arena), true);
assert.equal(isAdminNavActive("/admin/arena/emissions", arena), true);
assert.equal(isAdminNavActive("/admin/arena/archives", arena), true);
assert.equal(isAdminNavActive("/admin/arena/alertes", arena), true);
assert.equal(isAdminNavActive("/admin/arena/albums", arena), true);
assert.equal(isAdminNavActive("/admin/arena/guests", arena), true);
assert.equal(isAdminNavActive("/admin/arena/prochain-invite", arena), true);
assert.equal(adminNavTitle("/admin/arena/prochain-invite"), "Prochain invité");
assert.equal(adminNavTitle("/admin/arena/albums/x"), "Galerie");
assert.equal(adminNavTitle("/admin/arena/emissions"), "Émissions");
assert.equal(adminNavTitle("/admin"), "Tableau de bord");
assert.equal(adminNavTitle("/admin/articles/abc"), "Articles & chroniques");
assert.equal(adminNavTitle("/admin/evenements"), "Événements");
assert.equal(adminNavTitle("/admin/evenements/new"), "Événements");
assert.equal(adminNavTitle("/admin/newsletter"), "Newsletter");
assert.equal(
  ADMIN_NAV.filter((item) => item.group === "arena").length,
  1
);
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

assert.deepEqual(
  SITE_NAV.map((item) => item.href),
  ["/", "/evenements", "/a-propos", "/chroniques", "/publications", "/portfolio", "/collaborations", "/contact"]
);
assert.equal(
  SITE_NAV_DESKTOP.some((item) => item.href === "/collaborations"),
  false
);
assert.equal(
  SITE_NAV_WITH_ARENA.map((item) => item.href).indexOf("/arena-culture"),
  6
);
assert.deepEqual(
  ARENA_NAV.map((item) => item.label),
  ["Accueil", "Émissions", "Invités", "Affiches", "Galerie", "Archives"]
);
assert.deepEqual(
  ARENA_ADMIN_LINKS.map((item) => item.label),
  [
    "Page Arena",
    "Prochain invité",
    "Émissions",
    "Invités",
    "Galerie",
    "Archives",
    "Saisons",
    "Alertes",
  ]
);

console.log("admin nav tests: ok");
