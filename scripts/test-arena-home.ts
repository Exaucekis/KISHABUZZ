import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ARENA_EXPLORE_DEFAULTS,
  ARENA_HOME_DEFAULTS,
  ARENA_HOME_SECTION_META,
  ARENA_HOME_SECTIONS,
  applyArenaHomeSection,
  collectReplacedImages,
  parseArenaHome,
  patchArenaHomeFromForm,
} from "../src/lib/arena-home";
import { arenaSpotlightMode, planArenaSpotlight } from "../src/lib/arena-spotlight";
import { isAdminNavActive } from "../src/lib/admin-nav";
import { ADMIN_NAV } from "../src/lib/admin-nav";

function fillExplore(form: FormData, current = ARENA_HOME_DEFAULTS) {
  form.set("eyebrow", current.explore.eyebrow);
  form.set("title", current.explore.title);
  for (const item of current.explore.items) {
    form.set(`item_${item.key}_title`, item.title);
    form.set(`item_${item.key}_subtitle`, item.subtitle);
    form.set(`item_${item.key}_image`, item.image);
  }
}

function save(section: (typeof ARENA_HOME_SECTIONS)[number], current: typeof ARENA_HOME_DEFAULTS, form: FormData) {
  const drafted = applyArenaHomeSection(current, section, patchArenaHomeFromForm(section, current, form));
  return parseArenaHome(JSON.stringify(drafted), drafted.hero.text);
}

const empty = parseArenaHome(null, "");
assert.equal(empty.hero.line1, "Culture.");
assert.equal(empty.hero.line3, "Live.");
assert.equal(empty.explore.items.length, 6);
assert.equal(empty.explore.items[0].href, "/arena-culture/emissions");
assert.equal(empty.spotlight.emptyTitle, "Bientôt annoncé");
assert.deepEqual(
  empty.explore.items.map((item) => item.key),
  ["emissions", "invites", "affiches", "photos", "videos", "archives"]
);
assert.deepEqual([...ARENA_HOME_SECTIONS], [
  "hero",
  "explore",
  "spotlight",
  "scene",
  "shows",
  "posters",
  "photos",
  "memory",
]);
assert.deepEqual([...ARENA_HOME_SECTIONS], Object.keys(ARENA_HOME_SECTION_META));
assert.equal(ARENA_HOME_SECTION_META.hero.label, "Héro");
assert.equal(ARENA_HOME_SECTION_META.memory.label, "Archives");

const fromPresentation = parseArenaHome(null, "Texte historique Arena.");
assert.equal(fromPresentation.hero.text, "Texte historique Arena.");

assert.equal(parseArenaHome("{not json", "Seed").hero.line1, "Culture.");
assert.equal(parseArenaHome("{not json", "Seed").hero.text, "Seed");

const merged = parseArenaHome(
  JSON.stringify({
    hero: { line1: "Scène.", poster: "/uploads/hero.jpg" },
    explore: {
      title: "L’univers",
      items: [
        { key: "photos", title: "Coulisses", image: "/uploads/photos.jpg", href: "https://evil.example" },
        { key: "inconnu", title: "Hack", href: "/admin" },
      ],
    },
  }),
  "Présentation seed"
);
assert.equal(merged.hero.line1, "Scène.");
assert.equal(merged.hero.line2, "Émissions.");
assert.equal(merged.hero.poster, "/uploads/hero.jpg");
assert.equal(merged.hero.text, "Présentation seed");
assert.equal(merged.explore.title, "L’univers");
assert.equal(merged.explore.items.find((item) => item.key === "photos")?.title, "Coulisses");
assert.equal(merged.explore.items.find((item) => item.key === "photos")?.href, "/arena-culture/photos");
assert.equal(merged.explore.items.find((item) => item.key === "videos")?.title, "Vidéos");
assert.equal(merged.explore.items.some((item) => item.key === "inconnu"), false);

const withStoredText = parseArenaHome(
  JSON.stringify({ hero: { text: "Texte CMS." } }),
  "Ancienne présentation"
);
assert.equal(withStoredText.hero.text, "Texte CMS.");

const next = applyArenaHomeSection(merged, "hero", {
  hero: { ...merged.hero, poster: "/uploads/hero-new.jpg", text: "Nouveau texte." },
});
const replacedHero = collectReplacedImages(merged, next);
assert.equal(replacedHero.length, 1);
assert.equal(replacedHero[0].url, "/uploads/hero.jpg");
assert.equal(next.hero.text, "Nouveau texte.");
assert.equal(next.explore.title, "L’univers");

const firstPoster = applyArenaHomeSection(ARENA_HOME_DEFAULTS, "hero", {
  hero: { ...ARENA_HOME_DEFAULTS.hero, poster: "/uploads/first.jpg" },
});
assert.equal(collectReplacedImages(ARENA_HOME_DEFAULTS, firstPoster).length, 0);

const clearedPoster = applyArenaHomeSection(firstPoster, "hero", {
  hero: { ...firstPoster.hero, poster: "" },
});
assert.equal(collectReplacedImages(firstPoster, clearedPoster)[0]?.url, "/uploads/first.jpg");

const exploreNext = applyArenaHomeSection(ARENA_HOME_DEFAULTS, "explore", {
  explore: {
    ...ARENA_HOME_DEFAULTS.explore,
    items: ARENA_HOME_DEFAULTS.explore.items.map((item) =>
      item.key === "emissions" ? { ...item, image: "/uploads/new-emissions.jpg" } : item
    ),
  },
});
const replacedExplore = collectReplacedImages(ARENA_HOME_DEFAULTS, exploreNext);
assert.equal(replacedExplore.length, 1);
assert.equal(replacedExplore[0].title, "Explorer · Émissions");
assert.equal(collectReplacedImages(ARENA_HOME_DEFAULTS, ARENA_HOME_DEFAULTS).length, 0);

const sceneOnly = applyArenaHomeSection(merged, "scene", { scene: { eyebrow: "Studio", title: "Faces" } });
assert.equal(sceneOnly.scene.title, "Faces");
assert.equal(sceneOnly.hero.line1, "Scène.");
assert.equal(sceneOnly.explore.title, "L’univers");

const heroForm = new FormData();
heroForm.set("line1", "Culture.");
heroForm.set("line2", "Émissions.");
heroForm.set("line3", "Live.");
heroForm.set("text", "Présentation admin.");
heroForm.set("poster", "/uploads/hero-admin.jpg");
heroForm.set("ctaInvites", "Les invités");
const savedHero = save("hero", ARENA_HOME_DEFAULTS, heroForm);
assert.equal(savedHero.hero.text, "Présentation admin.");
assert.equal(savedHero.hero.ctaInvites, "Les invités");
assert.equal(savedHero.hero.poster, "/uploads/hero-admin.jpg");
assert.equal(savedHero.explore.title, "Univers Arena");

const emptyHero = new FormData();
emptyHero.set("line1", "   ");
emptyHero.set("line2", "Émissions.");
emptyHero.set("line3", "Live.");
emptyHero.set("text", "Garde ce texte.");
emptyHero.set("poster", "");
emptyHero.set("ctaInvites", "Invités");
const normalizedHero = save("hero", savedHero, emptyHero);
assert.equal(normalizedHero.hero.line1, "Culture.");
assert.equal(normalizedHero.hero.text, "Garde ce texte.");

const exploreForm = new FormData();
fillExplore(exploreForm);
exploreForm.set("title", "L’univers édité");
exploreForm.set("item_emissions_title", "Shows");
exploreForm.set("item_emissions_image", "/uploads/emissions.jpg");
exploreForm.set("item_emissions_href", "https://evil.example/phish");
const savedExplore = save("explore", ARENA_HOME_DEFAULTS, exploreForm);
assert.equal(savedExplore.explore.title, "L’univers édité");
assert.equal(savedExplore.explore.items[0].title, "Shows");
assert.equal(savedExplore.explore.items[0].href, "/arena-culture/emissions");
assert.equal(savedExplore.explore.items[0].image, "/uploads/emissions.jpg");
assert.equal(collectReplacedImages(ARENA_HOME_DEFAULTS, savedExplore).length, 1);

const spotlightForm = new FormData();
spotlightForm.set("emptyLabel", "Prochain nom");
spotlightForm.set("emptyTitle", "Annonce imminente");
spotlightForm.set("emptyBody", "Le nom sort vendredi.");
spotlightForm.set("emptyCta", "Écrire");
spotlightForm.set("emptySecondary", "Replays");
spotlightForm.set("chipShows", "Shows");
spotlightForm.set("chipVideos", "Clips");
spotlightForm.set("chipArchives", "Mémoire");
spotlightForm.set("chipCollab", "Plateau");
const savedSpot = save("spotlight", savedExplore, spotlightForm);
assert.equal(savedSpot.spotlight.emptyTitle, "Annonce imminente");
assert.equal(savedSpot.spotlight.chipCollab, "Plateau");
assert.equal(savedSpot.explore.title, "L’univers édité");

for (const section of ["scene", "shows", "posters", "photos"] as const) {
  const form = new FormData();
  form.set("eyebrow", `${section}-kicker`);
  form.set("title", `${section}-title`);
  const saved = save(section, ARENA_HOME_DEFAULTS, form);
  assert.equal(saved[section].eyebrow, `${section}-kicker`);
  assert.equal(saved[section].title, `${section}-title`);
  assert.equal(saved.hero.line1, "Culture.");
}

const memoryForm = new FormData();
memoryForm.set("eyebrow", "Souvenirs");
memoryForm.set("title", "Mémoire vive");
memoryForm.set("body", "Tout revoir.");
memoryForm.set("cta", "Archives");
memoryForm.set("secondary", "Écrire");
const savedMemory = save("memory", ARENA_HOME_DEFAULTS, memoryForm);
assert.equal(savedMemory.memory.title, "Mémoire vive");
assert.equal(savedMemory.memory.cta, "Archives");

const rows = [
  { id: "old", status: "PUBLISHED", isFeatured: true, isGuestOfWeek: true },
  { id: "next", status: "DRAFT", isFeatured: false, isGuestOfWeek: false },
];
const announced = planArenaSpotlight(rows, "next", "SCHEDULED");
assert.equal(announced.find((row) => row.id === "old")?.status, "ARCHIVED");
assert.equal(announced.find((row) => row.id === "next")?.isFeatured, true);
assert.equal(arenaSpotlightMode({ status: "SCHEDULED" }), "announced");
assert.equal(arenaSpotlightMode({ status: "PUBLISHED", videoUrl: "https://youtu.be/x" }), "headline");
assert.equal(arenaSpotlightMode(null), "empty");

const arenaNav = ADMIN_NAV.find((item) => item.href === "/admin/arena")!;
assert.equal(isAdminNavActive("/admin/arena", arenaNav), true);
assert.equal(isAdminNavActive("/admin/arena/emissions", arenaNav), true);
assert.equal(isAdminNavActive("/admin/arena/archives", arenaNav), true);
assert.equal(isAdminNavActive("/admin/arena/new", arenaNav), true);
assert.equal(isAdminNavActive("/admin/arena/show1", arenaNav), true);
assert.equal(isAdminNavActive("/admin/arena/guests", arenaNav), false);
assert.equal(isAdminNavActive("/admin/arena/albums", arenaNav), false);

assert.equal(
  ARENA_EXPLORE_DEFAULTS.every((item) => item.href.startsWith("/arena-culture/")),
  true
);

const publicArena = readFileSync("src/app/(site)/arena-culture/page.tsx", "utf8");
assert.match(publicArena, /home\.hero\.line1/);
assert.match(publicArena, /home\.explore\.items/);
assert.match(publicArena, /await connection\(\)/);
const publicHome = readFileSync("src/app/(site)/page.tsx", "utf8");
assert.match(publicHome, /arenaHome/);
assert.match(publicHome, /arenaHome\.explore\.items/);

console.log("arena home tests: ok");
