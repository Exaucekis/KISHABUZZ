export const ARENA_HOME_KEY = "arena.home";

export type ArenaExploreItem = {
  key: string;
  href: string;
  title: string;
  subtitle: string;
  image: string;
};

export type ArenaHomeConfig = {
  hero: {
    line1: string;
    line2: string;
    line3: string;
    text: string;
    poster: string;
    ctaInvites: string;
  };
  explore: {
    eyebrow: string;
    title: string;
    items: ArenaExploreItem[];
  };
  spotlight: {
    emptyLabel: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    emptySecondary: string;
    chipShows: string;
    chipVideos: string;
    chipArchives: string;
    chipCollab: string;
  };
  scene: { eyebrow: string; title: string };
  shows: { eyebrow: string; title: string };
  posters: { eyebrow: string; title: string };
  photos: { eyebrow: string; title: string };
  memory: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    secondary: string;
  };
};

export const ARENA_EXPLORE_DEFAULTS: ArenaExploreItem[] = [
  {
    key: "emissions",
    href: "/arena-culture/emissions",
    title: "Émissions",
    subtitle: "Épisodes & replays",
    image: "/artists/fally-ipupa.jpg",
  },
  {
    key: "affiches",
    href: "/arena-culture/affiches",
    title: "Affiches",
    subtitle: "Visuels officiels",
    image: "/artists/koffi-olomide.jpg",
  },
  {
    key: "photos",
    href: "/arena-culture/photos",
    title: "Galerie",
    subtitle: "Albums par invité",
    image: "/artists/ferre-gola.jpg",
  },
  {
    key: "archives",
    href: "/arena-culture/archives",
    title: "Archives",
    subtitle: "Saisons passées",
    image: "/artists/damso.jpg",
  },
];

export const ARENA_HOME_DEFAULTS: ArenaHomeConfig = {
  hero: {
    line1: "Culture.",
    line2: "Émissions.",
    line3: "Live.",
    text: "Arena Culture est l'univers médiatique intégré de KISHA BUZZ : émissions, invités, affiches, photos, vidéos et archives.",
    poster: "",
    ctaInvites: "Invités",
  },
  explore: {
    eyebrow: "Explorer",
    title: "Univers Arena",
    items: ARENA_EXPLORE_DEFAULTS,
  },
  spotlight: {
    emptyLabel: "Prochain invité",
    emptyTitle: "Bientôt annoncé",
    emptyBody:
      "L'invité de la semaine sera annoncé ici. Propose une collaboration ou explore la scène.",
    emptyCta: "Proposer un invité",
    emptySecondary: "Émissions",
    chipShows: "Émissions",
    chipVideos: "Vidéos",
    chipArchives: "Archives",
    chipCollab: "Collaborer",
  },
  scene: { eyebrow: "Scène", title: "Visages & voix" },
  shows: { eyebrow: "Émissions", title: "À (re)découvrir" },
  posters: { eyebrow: "Affiches", title: "Visuels" },
  photos: { eyebrow: "Galerie", title: "Albums" },
  memory: {
    eyebrow: "Archives",
    title: "La mémoire de l'Arena",
    body: "Retrouve les saisons et épisodes déjà diffusés.",
    cta: "Ouvrir les archives",
    secondary: "Collaborer",
  },
};

/** Toutes les clés enregistrées en CMS (y compris anciennes). */
export const ARENA_HOME_SECTIONS = [
  "hero",
  "explore",
  "spotlight",
  "scene",
  "shows",
  "posters",
  "photos",
  "memory",
] as const;

/** Onglets « Page Arena » : textes d’accueil seulement, sans doubler Émissions ni le menu. */
export const PAGE_ARENA_SECTIONS = ["hero", "spotlight", "scene", "posters", "photos", "memory"] as const;

export type ArenaHomeSection = (typeof ARENA_HOME_SECTIONS)[number];

export const ARENA_HOME_SECTION_META: Record<
  ArenaHomeSection,
  { label: string; where: string }
> = {
  hero: {
    label: "Héro",
    where: "le titre d’ouverture et le visuel d’entrée, sur /arena-culture et l’accueil",
  },
  explore: {
    label: "Univers",
    where: "données conservées en CMS, plus affichées comme cartes de menu",
  },
  spotlight: {
    label: "À la une",
    where: "l’affiche du prochain invité, publiée depuis l’onglet Prochain invité",
  },
  scene: {
    label: "Scène",
    where: "la rangée Visages & voix",
  },
  shows: {
    label: "Émissions",
    where: "invité, domaine, vidéo et miniature, sur /arena-culture/emissions",
  },
  posters: {
    label: "Affiches",
    where: "la rangée des visuels / affiches",
  },
  photos: {
    label: "Galerie",
    where: "la rangée Galerie / albums, sur /arena-culture et l’accueil",
  },
  memory: {
    label: "Archives",
    where: "le bloc de clôture La mémoire de l’Arena",
  },
};

function text(value: unknown, fallback: string) {
  const next = String(value ?? "").trim();
  return next || fallback;
}

function mergeExplore(raw: unknown): ArenaExploreItem[] {
  const incoming = Array.isArray(raw) ? raw : [];
  return ARENA_EXPLORE_DEFAULTS.map((item) => {
    const row = incoming.find((entry) => String(entry?.key || "") === item.key) || {};
    return {
      key: item.key,
      href: item.href,
      title: text(row.title, item.title),
      subtitle: text(row.subtitle, item.subtitle),
      image: text(row.image, item.image),
    };
  });
}

export function parseArenaHome(raw: string | null | undefined, presentation = ""): ArenaHomeConfig {
  let parsed: Partial<ArenaHomeConfig> = {};
  if (raw) {
    try {
      parsed = JSON.parse(raw) as Partial<ArenaHomeConfig>;
    } catch {
      parsed = {};
    }
  }
  const d = ARENA_HOME_DEFAULTS;
  return {
    hero: {
      line1: text(parsed.hero?.line1, d.hero.line1),
      line2: text(parsed.hero?.line2, d.hero.line2),
      line3: text(parsed.hero?.line3, d.hero.line3),
      text: text(parsed.hero?.text, presentation || d.hero.text),
      poster: String(parsed.hero?.poster || ""),
      ctaInvites: text(parsed.hero?.ctaInvites, d.hero.ctaInvites),
    },
    explore: {
      eyebrow: text(parsed.explore?.eyebrow, d.explore.eyebrow),
      title: text(parsed.explore?.title, d.explore.title),
      items: mergeExplore(parsed.explore?.items),
    },
    spotlight: {
      emptyLabel: text(parsed.spotlight?.emptyLabel, d.spotlight.emptyLabel),
      emptyTitle: text(parsed.spotlight?.emptyTitle, d.spotlight.emptyTitle),
      emptyBody: text(parsed.spotlight?.emptyBody, d.spotlight.emptyBody),
      emptyCta: text(parsed.spotlight?.emptyCta, d.spotlight.emptyCta),
      emptySecondary: text(parsed.spotlight?.emptySecondary, d.spotlight.emptySecondary),
      chipShows: text(parsed.spotlight?.chipShows, d.spotlight.chipShows),
      chipVideos: text(parsed.spotlight?.chipVideos, d.spotlight.chipVideos),
      chipArchives: text(parsed.spotlight?.chipArchives, d.spotlight.chipArchives),
      chipCollab: text(parsed.spotlight?.chipCollab, d.spotlight.chipCollab),
    },
    scene: {
      eyebrow: text(parsed.scene?.eyebrow, d.scene.eyebrow),
      title: text(parsed.scene?.title, d.scene.title),
    },
    shows: {
      eyebrow: text(parsed.shows?.eyebrow, d.shows.eyebrow),
      title: text(parsed.shows?.title, d.shows.title),
    },
    posters: {
      eyebrow: text(parsed.posters?.eyebrow, d.posters.eyebrow),
      title: text(parsed.posters?.title, d.posters.title),
    },
    photos: {
      eyebrow: text(parsed.photos?.eyebrow, d.photos.eyebrow),
      title: text(parsed.photos?.title, d.photos.title),
    },
    memory: {
      eyebrow: text(parsed.memory?.eyebrow, d.memory.eyebrow),
      title: text(parsed.memory?.title, d.memory.title),
      body: text(parsed.memory?.body, d.memory.body),
      cta: text(parsed.memory?.cta, d.memory.cta),
      secondary: text(parsed.memory?.secondary, d.memory.secondary),
    },
  };
}

export function collectReplacedImages(previous: ArenaHomeConfig, next: ArenaHomeConfig) {
  const replaced: { title: string; url: string }[] = [];
  const push = (title: string, before: string, after: string) => {
    const oldUrl = String(before || "").trim();
    const newUrl = String(after || "").trim();
    if (oldUrl && oldUrl !== newUrl) replaced.push({ title, url: oldUrl });
  };
  push("Héro Arena", previous.hero.poster, next.hero.poster);
  for (const item of previous.explore.items) {
    const updated = next.explore.items.find((row) => row.key === item.key);
    push(`Explorer · ${item.title}`, item.image, updated?.image || "");
  }
  return replaced;
}

function readForm(form: { get(name: string): FormDataEntryValue | null }, key: string) {
  return String(form.get(key) ?? "").trim();
}

export function patchArenaHomeFromForm(
  section: ArenaHomeSection,
  current: ArenaHomeConfig,
  form: { get(name: string): FormDataEntryValue | null }
): Partial<ArenaHomeConfig> {
  if (section === "hero") {
    return {
      hero: {
        ...current.hero,
        line1: readForm(form, "line1"),
        line2: readForm(form, "line2"),
        line3: readForm(form, "line3"),
        text: readForm(form, "text"),
        poster: readForm(form, "poster"),
        ctaInvites: readForm(form, "ctaInvites"),
      },
    };
  }
  if (section === "explore") {
    return {
      explore: {
        eyebrow: readForm(form, "eyebrow"),
        title: readForm(form, "title"),
        items: ARENA_EXPLORE_DEFAULTS.map((item) => ({
          ...item,
          title: readForm(form, `item_${item.key}_title`),
          subtitle: readForm(form, `item_${item.key}_subtitle`),
          image: readForm(form, `item_${item.key}_image`),
        })),
      },
    };
  }
  if (section === "spotlight") {
    return {
      spotlight: {
        ...current.spotlight,
        emptyLabel: readForm(form, "emptyLabel"),
        emptyTitle: readForm(form, "emptyTitle"),
        emptyBody: readForm(form, "emptyBody"),
        emptyCta: readForm(form, "emptyCta"),
        emptySecondary: readForm(form, "emptySecondary"),
        chipShows: readForm(form, "chipShows"),
        chipVideos: readForm(form, "chipVideos"),
        chipArchives: readForm(form, "chipArchives"),
        chipCollab: readForm(form, "chipCollab"),
      },
    };
  }
  if (section === "scene") {
    return { scene: { eyebrow: readForm(form, "eyebrow"), title: readForm(form, "title") } };
  }
  if (section === "shows") {
    return { shows: { eyebrow: readForm(form, "eyebrow"), title: readForm(form, "title") } };
  }
  if (section === "posters") {
    return { posters: { eyebrow: readForm(form, "eyebrow"), title: readForm(form, "title") } };
  }
  if (section === "photos") {
    return { photos: { eyebrow: readForm(form, "eyebrow"), title: readForm(form, "title") } };
  }
  return {
    memory: {
      ...current.memory,
      eyebrow: readForm(form, "eyebrow"),
      title: readForm(form, "title"),
      body: readForm(form, "body"),
      cta: readForm(form, "cta"),
      secondary: readForm(form, "secondary"),
    },
  };
}

export function applyArenaHomeSection(
  current: ArenaHomeConfig,
  section: ArenaHomeSection,
  patch: Partial<ArenaHomeConfig>
): ArenaHomeConfig {
  if (section === "hero" && patch.hero) return { ...current, hero: { ...current.hero, ...patch.hero } };
  if (section === "explore" && patch.explore) {
    return {
      ...current,
      explore: {
        ...current.explore,
        ...patch.explore,
        items: mergeExplore(patch.explore.items || current.explore.items),
      },
    };
  }
  if (section === "spotlight" && patch.spotlight) {
    return { ...current, spotlight: { ...current.spotlight, ...patch.spotlight } };
  }
  if (section === "scene" && patch.scene) return { ...current, scene: { ...current.scene, ...patch.scene } };
  if (section === "shows" && patch.shows) return { ...current, shows: { ...current.shows, ...patch.shows } };
  if (section === "posters" && patch.posters) {
    return { ...current, posters: { ...current.posters, ...patch.posters } };
  }
  if (section === "photos" && patch.photos) {
    return { ...current, photos: { ...current.photos, ...patch.photos } };
  }
  if (section === "memory" && patch.memory) {
    return { ...current, memory: { ...current.memory, ...patch.memory } };
  }
  return current;
}
