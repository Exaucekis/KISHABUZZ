"use client";

import { useActionState, useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveArenaHomeSection } from "@/actions/admin/arena-home";
import { AdminHint } from "@/components/admin/AdminHint";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { MediaField } from "@/components/admin/MediaField";
import { SaveResultDialog } from "@/components/admin/SaveResultDialog";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";
import {
  ARENA_HOME_SECTION_META,
  PAGE_ARENA_SECTIONS,
  type ArenaHomeConfig,
  type ArenaHomeSection,
} from "@/lib/arena-home";

export type ArenaHomeLive = {
  headline: {
    id: string;
    title: string;
    status: string;
    poster: string;
    guestName: string | null;
    hasVideo: boolean;
  } | null;
  announced: {
    id: string;
    title: string;
    status: string;
    poster: string;
    guestName: string | null;
  } | null;
  guests: { id: string; name: string; photo: string }[];
  shows: { id: string; title: string; poster: string; videoThumbnail?: string }[];
  albums: { slug: string; title: string; cover: string }[];
  archivedCount: number;
};

const initial: AdminActionState = { ok: false, message: "" };

function SectionForm({
  section,
  title,
  kicker,
  hint,
  children,
}: {
  section: ArenaHomeSection;
  title: string;
  kicker: string;
  hint: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const meta = ARENA_HOME_SECTION_META[section];
  const index = (PAGE_ARENA_SECTIONS as readonly string[]).indexOf(section) + 1;
  const total = PAGE_ARENA_SECTIONS.length;
  const [state, action] = useActionState(saveArenaHomeSection, initial);
  const [popup, setPopup] = useState(false);
  const closePopup = useCallback(() => setPopup(false), []);

  useEffect(() => {
    if (!state.message) return;
    setPopup(true);
    if (state.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={action} id={`rubrique-${section}`} className="admin-card scroll-mt-24 space-y-4">
      <input type="hidden" name="section" value={section} />
      <div className="admin-rubric-head">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#9aa3b5]">
            Rubrique {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")} · {kicker}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-syne)] text-xl font-bold">{title}</h2>
          <p className="admin-page-hint mt-2 max-w-2xl">
            {hint} Le bouton ci-dessous n’enregistre que « {meta.label} ».
          </p>
        </div>
      </div>
      {children}
      {state.message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.ok
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-red-400/30 bg-red-400/10 text-red-200"
          }`}
        >
          {state.ok ? `Rubrique « ${meta.label} » enregistrée.` : state.message}
        </p>
      ) : null}
      <div className="admin-rubric-foot">
        <SubmitButton pendingLabel={`Enregistrement de ${meta.label}…`}>
          Enregistrer « {meta.label} »
        </SubmitButton>
        <p className="admin-action-hint">
          Visible sur {meta.where}. Les autres rubriques ne changent pas.
        </p>
      </div>
      <SaveResultDialog
        open={popup && Boolean(state.message)}
        ok={state.ok}
        title={state.ok ? `« ${meta.label} » est en ligne` : `« ${meta.label} » n’a pas été enregistré`}
        description={state.message}
        onClose={closePopup}
      />
    </form>
  );
}

function LiveTiles({
  items,
  empty,
  moreHref,
  moreLabel,
}: {
  items: { href: string; title: string; image?: string; meta?: string }[];
  empty: string;
  moreHref: string;
  moreLabel: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">En ligne maintenant</p>
        <Link href={moreHref} className="text-xs text-[#9aa3b5] hover:text-white">
          {moreLabel}
        </Link>
      </div>
      {items.length ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={`${item.href}-${item.title}`}
              href={item.href}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 p-2 hover:border-white/20"
            >
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="h-10 w-10 rounded object-cover" />
              ) : null}
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                {item.meta ? <span className="block truncate text-xs text-[#9aa3b5]">{item.meta}</span> : null}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#9aa3b5]">{empty}</p>
      )}
    </div>
  );
}

export function ArenaHomeDashboard({
  home,
  live,
}: {
  home: ArenaHomeConfig;
  live: ArenaHomeLive;
}) {
  const [active, setActive] = useState<ArenaHomeSection>("hero");

  useEffect(() => {
    const fromHash = () => {
      const raw = window.location.hash.replace("#rubrique-", "");
      if ((PAGE_ARENA_SECTIONS as readonly string[]).includes(raw)) {
        setActive(raw as ArenaHomeSection);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  function openSection(section: ArenaHomeSection) {
    setActive(section);
    window.history.replaceState(null, "", `#rubrique-${section}`);
  }

  return (
    <div className="space-y-5">
      <AdminTabs
        label="Rubriques de la page Arena"
        items={PAGE_ARENA_SECTIONS.map((id) => ({
          id,
          label: ARENA_HOME_SECTION_META[id].label,
          hint: ARENA_HOME_SECTION_META[id].where,
          active: active === id,
          onSelect: () => openSection(id),
        }))}
      />

      <div hidden={active !== "hero"}>
      <SectionForm
        section="hero"
        kicker="Culture. Émissions. Live."
        title="Héro"
        hint="Titres, texte de présentation et visuel d’ouverture. Un nouveau visuel envoie l’ancien aux archives / affiches."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="admin-field">
            <label>Ligne 1</label>
            <input name="line1" required defaultValue={home.hero.line1} />
          </div>
          <div className="admin-field">
            <label>Ligne 2</label>
            <input name="line2" required defaultValue={home.hero.line2} />
          </div>
          <div className="admin-field">
            <label>Ligne 3</label>
            <input name="line3" required defaultValue={home.hero.line3} />
          </div>
          <div className="admin-field sm:col-span-3">
            <label>Présentation</label>
            <textarea name="text" rows={3} required defaultValue={home.hero.text} />
            <AdminHint>Phrase sous le titre. Visible aussi comme texte Arena Culture.</AdminHint>
          </div>
          <input type="hidden" name="ctaInvites" value={home.hero.ctaInvites} />
        </div>
        <MediaField
          name="poster"
          label="Visuel d’ouverture (test ou définitif)"
          defaultValue={home.hero.poster}
          folder="arena"
          hint="Sans visuel, le héro tourne sur les images de plateau. Remplacer archive l’ancien."
        />
      </SectionForm>
      </div>

      <div hidden={active !== "spotlight"}>
      <SectionForm
        section="spotlight"
        kicker="À la une"
        title="Textes d’attente"
        hint="Ces textes s’affichent seulement s’il n’y a pas encore de prochain invité. Pour publier l’invité et son affiche, ouvrez l’onglet Prochain invité — pas Galerie."
      >
        <input type="hidden" name="chipShows" value={home.spotlight.chipShows} />
        <input type="hidden" name="chipVideos" value={home.spotlight.chipVideos} />
        <input type="hidden" name="chipArchives" value={home.spotlight.chipArchives} />
        <input type="hidden" name="chipCollab" value={home.spotlight.chipCollab} />
        <p className="text-sm text-[#9aa3b5]">
          Vidéo en cours : {live.headline?.guestName || live.headline?.title || "aucune"} ·{" "}
          <Link href="/admin/arena/emissions" className="underline">
            Émissions
          </Link>
          {" · "}
          Prochain invité : {live.announced?.guestName || live.announced?.title || "non annoncé"} ·{" "}
          <Link href="/admin/arena/prochain-invite" className="underline">
            Prochain invité
          </Link>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="admin-field">
            <label>Sur-titre (vide)</label>
            <input name="emptyLabel" required defaultValue={home.spotlight.emptyLabel} />
          </div>
          <div className="admin-field">
            <label>Titre (vide)</label>
            <input name="emptyTitle" required defaultValue={home.spotlight.emptyTitle} />
          </div>
          <div className="admin-field sm:col-span-2">
            <label>Texte (vide)</label>
            <textarea name="emptyBody" rows={3} required defaultValue={home.spotlight.emptyBody} />
          </div>
          <div className="admin-field">
            <label>Bouton principal</label>
            <input name="emptyCta" required defaultValue={home.spotlight.emptyCta} />
          </div>
          <div className="admin-field">
            <label>Bouton secondaire</label>
            <input name="emptySecondary" required defaultValue={home.spotlight.emptySecondary} />
          </div>
        </div>
      </SectionForm>
      </div>

      <div hidden={active !== "scene"}>
      <SectionForm
        section="scene"
        kicker={home.scene.eyebrow}
        title={home.scene.title}
        hint="Titres de la rangée Visages & voix. Les portraits viennent des invités publiés."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="admin-field">
            <label>Sur-titre</label>
            <input name="eyebrow" required defaultValue={home.scene.eyebrow} />
          </div>
          <div className="admin-field">
            <label>Titre</label>
            <input name="title" required defaultValue={home.scene.title} />
          </div>
        </div>
        <LiveTiles
          items={live.guests.map((guest) => ({
            href: `/admin/arena/guests`,
            title: guest.name,
            image: guest.photo,
          }))}
          empty="Aucun invité publié. Ajoute-les dans Invités."
          moreHref="/admin/arena/guests"
          moreLabel="Gérer les invités"
        />
      </SectionForm>
      </div>

      <div hidden={active !== "posters"}>
      <SectionForm
        section="posters"
        kicker={home.posters.eyebrow}
        title={home.posters.title}
        hint="Titres de la rangée visuels. Les affiches sont celles des émissions ; les anciens visuels de page y sont archivés."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="admin-field">
            <label>Sur-titre</label>
            <input name="eyebrow" required defaultValue={home.posters.eyebrow} />
          </div>
          <div className="admin-field">
            <label>Titre</label>
            <input name="title" required defaultValue={home.posters.title} />
          </div>
        </div>
        <LiveTiles
          items={live.shows
            .filter((show) => show.poster)
            .map((show) => ({
              href: `/admin/arena/${show.id}`,
              title: show.title,
              image: show.poster,
            }))}
          empty="Pas encore d’affiche d’émission. Les visuels archivés restent sur Affiches."
          moreHref="/admin/arena/emissions"
          moreLabel="Éditer les affiches"
        />
      </SectionForm>
      </div>

      <div hidden={active !== "photos"}>
      <SectionForm
        section="photos"
        kicker={home.photos.eyebrow}
        title={home.photos.title}
        hint="Titres de la rangée Ambiances. Les photos viennent des albums plateaux & coulisses."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="admin-field">
            <label>Sur-titre</label>
            <input name="eyebrow" required defaultValue={home.photos.eyebrow} />
          </div>
          <div className="admin-field">
            <label>Titre</label>
            <input name="title" required defaultValue={home.photos.title} />
          </div>
        </div>
        <LiveTiles
          items={live.albums.map((album) => ({
            href: `/admin/arena/albums/${album.slug}`,
            title: album.title,
            image: album.cover,
          }))}
          empty="Aucun album photo publié."
          moreHref="/admin/arena/albums"
          moreLabel="Gérer les albums"
        />
      </SectionForm>
      </div>

      <div hidden={active !== "memory"}>
      <SectionForm
        section="memory"
        kicker={home.memory.eyebrow}
        title={home.memory.title}
        hint="Bloc de clôture vers les archives et la collaboration. Les saisons passées restent rejouables."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="admin-field">
            <label>Sur-titre</label>
            <input name="eyebrow" required defaultValue={home.memory.eyebrow} />
          </div>
          <div className="admin-field">
            <label>Titre</label>
            <input name="title" required defaultValue={home.memory.title} />
          </div>
          <div className="admin-field sm:col-span-2">
            <label>Texte</label>
            <textarea name="body" rows={2} required defaultValue={home.memory.body} />
          </div>
          <div className="admin-field">
            <label>Bouton archives</label>
            <input name="cta" required defaultValue={home.memory.cta} />
          </div>
          <div className="admin-field">
            <label>Bouton collaborer</label>
            <input name="secondary" required defaultValue={home.memory.secondary} />
          </div>
        </div>
        <p className="text-sm text-[#9aa3b5]">
          {live.archivedCount
            ? `${live.archivedCount} émission${live.archivedCount > 1 ? "s" : ""} en archives / rediffusion.`
            : "Les archives se remplissent dès qu’une nouvelle émission passe à la une."}{" "}
          <Link href="/admin/arena/archives" className="underline">
            Ouvrir les archives
          </Link>
        </p>
      </SectionForm>
      </div>
    </div>
  );
}
