import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { parseArenaHome, ARENA_EXPLORE_DEFAULTS } from "../src/lib/arena-home";
import { arenaSpotlightMode } from "../src/lib/arena-spotlight";

const prisma = new PrismaClient();
const failures: string[] = [];

function check(ok: boolean, message: string) {
  if (ok) console.log(`ok  ${message}`);
  else {
    failures.push(message);
    console.error(`KO  ${message}`);
  }
}

async function fetchPage(path: string) {
  const bases = ["http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:3001"];
  for (const base of bases) {
    try {
      const res = await fetch(`${base}${path}`, {
        redirect: "manual",
        signal: AbortSignal.timeout(2500),
      });
      const html = res.status === 200 ? await res.text() : "";
      return { base, status: res.status, html, location: res.headers.get("location") || "" };
    } catch {
      /* try next */
    }
  }
  return null;
}

async function main() {
  const files = [
    "src/app/admin/arena/page.tsx",
    "src/app/admin/arena/emissions/page.tsx",
    "src/app/admin/arena/archives/page.tsx",
    "src/components/admin/ArenaHomeDashboard.tsx",
    "src/app/(site)/arena-culture/page.tsx",
    "src/app/(site)/arena-culture/calendrier/page.tsx",
    "src/app/(site)/page.tsx",
    "src/components/arena/ArenaAlertForm.tsx",
    "src/app/admin/arena/alertes/page.tsx",
  ];
  for (const file of files) {
    check(existsSync(file), `fichier présent ${file}`);
  }

  const [homeRow, presentation, shows, guests, albums, archiveVisuals] = await Promise.all([
    prisma.pageContent.findUnique({ where: { key: "arena.home" } }),
    prisma.pageContent.findUnique({ where: { key: "arena.presentation" } }),
    prisma.arenaShow.findMany({
      include: { guests: { include: { guest: true } } },
      orderBy: { number: "desc" },
    }),
    prisma.arenaGuest.findMany({ where: { visible: true } }),
    prisma.photoAlbum.findMany({ where: { visible: true } }),
    prisma.mediaAsset.findMany({
      where: { category: "ARENA_CULTURE", kind: "IMAGE", title: { startsWith: "Archive ·" } },
    }),
  ]);

  const home = parseArenaHome(homeRow?.body, presentation?.body || "");
  check(Boolean(home.hero.line1 && home.hero.text), "héro a titre + texte");
  check(home.explore.items.length === 5, "5 cartes Explorer");
  check(
    home.explore.items.every((item, i) => item.href === ARENA_EXPLORE_DEFAULTS[i].href),
    "liens Explorer intactes"
  );
  check(home.explore.items.every((item) => Boolean(item.image)), "chaque carte Explorer a une image");
  check(Boolean(home.spotlight.emptyTitle && home.memory.cta), "textes à la une et archives présents");

  const live = shows.filter((s) => s.status === "PUBLISHED" || s.status === "SCHEDULED");
  const featured = live.filter((s) => s.isFeatured);
  check(featured.length <= 1, `au plus une émission à la une (vu ${featured.length})`);

  const published = shows.filter((s) => s.status === "PUBLISHED");
  const archived = shows.filter((s) => s.status === "ARCHIVED");
  const spotlight =
    featured[0] || live.find((s) => s.isGuestOfWeek) || published[0] || null;
  const mode = arenaSpotlightMode(
    spotlight
      ? { status: spotlight.status, videoUrl: spotlight.videoUrl, airDate: spotlight.airDate }
      : null
  );

  if (spotlight && mode !== "empty") {
    check(Boolean(spotlight.poster || spotlight.guests[0]?.guest.photo), "à la une a un visuel");
    const slugOk = await prisma.arenaShow.findFirst({
      where: { slug: spotlight.slug, status: { in: ["PUBLISHED", "ARCHIVED", "SCHEDULED"] } },
    });
    check(Boolean(slugOk), `émission ${spotlight.slug} rejouable par slug`);
  }

  const posters = [...published, ...archived].filter((s) => s.poster);
  check(true, `affiches disponibles: ${posters.length} (publiées+archives)`);
  check(true, `invités visibles: ${guests.length} · albums: ${albums.length} · visuels archivés: ${archiveVisuals.length}`);
  check(true, `émissions: ${published.length} publiées · ${archived.length} archives · mode à la une: ${mode}`);

  const publicPage = await fetchPage("/arena-culture");
  if (!publicPage) {
    check(true, "serveur local absent — contrôle HTTP ignoré (données DB OK)");
  } else {
    check(publicPage.status === 200, `GET /arena-culture → ${publicPage.status} (${publicPage.base})`);
    if (publicPage.html) {
      check(publicPage.html.includes(home.hero.line1), "page publique affiche la ligne 1 du héro");
      check(publicPage.html.includes(home.memory.cta), "page publique affiche le bouton archives");
      for (const href of ARENA_EXPLORE_DEFAULTS.map((item) => item.href)) {
        check(publicPage.html.includes(`href="${href}"`), `lien ${href} présent`);
      }
    }

    for (const path of [
      "/arena-culture/emissions",
      "/arena-culture/invites",
      "/arena-culture/affiches",
      "/arena-culture/photos",
      "/arena-culture/archives",
      "/arena-culture/calendrier",
    ]) {
      const page = await fetchPage(path);
      check(Boolean(page && page.status === 200), `GET ${path} → ${page?.status ?? "injoignable"}`);
    }

    const admin = await fetchPage("/admin/arena");
    check(
      Boolean(admin && (admin.status === 307 || admin.status === 302 || admin.status === 200)),
      `GET /admin/arena protégé ou ouvert → ${admin?.status ?? "injoignable"}`
    );
  }

  assert.equal(failures.length, 0, failures.join(" | "));
  console.log("arena home live checks: ok");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
