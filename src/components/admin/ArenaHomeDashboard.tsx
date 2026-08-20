"use client";

import { useActionState, useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveArenaHomeSection } from "@/actions/admin/arena-home";
import { AdminHint } from "@/components/admin/AdminHint";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { MediaField } from "@/components/admin/MediaField";
import { SaveResultDialog } from "@/components/admin/SaveResultDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { AdminActionState } from "@/lib/admin";
import {
  ARENA_HOME_SECTIONS,
  ARENA_HOME_SECTION_META,
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
  shows: { id: string; title: string; poster: string }[];
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
  const index = ARENA_HOME_SECTIONS.indexOf(section) + 1;
  const total = ARENA_HOME_SECTIONS.length;
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

export function ArenaHomeDashboard({ home, live }: { home: ArenaHomeConfig; live: ArenaHomeLive }) {
  const [active, setActive] = useState<ArenaHomeSection>("hero");

  useEffect(() => {
    const fromHash = () => {
      const raw = window.location.hash.replace("#rubrique-", "");
      if ((ARENA_HOME_SECTIONS as readonly string[]).includes(raw)) {
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
        items={ARENA_HOME_SECTIONS.map((id) => ({
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
          <div className="admin-field">
            <label>Bouton secondaire</label>
            <input name="ctaInvites" required defaultValue={home.hero.ctaInvites} />
            <AdminHint>Libellé du bouton vers les invités.</AdminHint>
          </div>
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

      <div hidden={active !== "explore"}>
      <SectionForm
        section="explore"
        kicker="Explorer"
        title={home.explore.title}
        hint="Les six portes de l’univers Arena. Titre, sous-titre et image de chaque carte. Les liens restent ceux du site."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="admin-field">
            <label>Sur-titre</label>
            <input name="eyebrow" required defaultValue={home.explore.eyebrow} />
          </div>
          <div className="admin-field">
            <label>Titre</label>
            <input name="title" required defaultValue={home.explore.title} />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {home.explore.items.map((item) => (
            <div key={item.key} className="rounded-xl border border-white/10 p-3">
              <p className="mb-3 text-xs uppercase tracking-wide text-[#9aa3b5]">{item.href}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="admin-field">
                  <label>Titre</label>
                  <input name={`item_${item.key}_title`} required defaultValue={item.title} />
                </div>
                <div className="admin-field">
                  <label>Sous-titre</label>
                  <input name={`item_${item.key}_subtitle`} required defaultValue={item.subtitle} />
                </div>
              </div>
              <MediaField
                name={`item_${item.key}_image`}
                label="Image"
                defaultValue={item.image}
                folder="arena"
              />
            </div>
          ))}
        </div>
      </SectionForm>
      </div>

      <div hidden={active !== "spotlight"}>
      <SectionForm
        section="spotlight"
        kicker="À la une"
        title="Vidéo et prochain invité"
        hint="Deux places : la vidéo d’émission en première, l’affiche du prochain invité juste en dessous. Une nouvelle vidéo archive l’ancienne, sans toucher à l’annonce."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {live.headline ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
              {live.headline.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={live.headline.poster} alt="" className="h-16 w-12 rounded object-cover" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-amber-200">Vidéo / émission en première</p>
                <p className="font-medium">{live.headline.guestName || live.headline.title}</p>
                <p className="text-sm text-[#9aa3b5]">
                  {live.headline.hasVideo
                    ? "Visible en haut de l’accueil et Arena. La prochaine vidéo enverra celle-ci aux archives."
                    : "En première, sans vidéo pour l’instant. Ajoutez un fichier ou un lien dans l’émission."}
                </p>
              </div>
              <StatusBadge status={live.headline.status} />
              <Link href={`/admin/arena/${live.headline.id}`} className="admin-btn admin-btn-primary text-xs">
                Modifier la vidéo
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">Vidéo en première</p>
              <p className="mt-1 text-sm text-[#eef1f6]">Aucune vidéo d’émission en première.</p>
              <Link href="/admin/arena/new" className="admin-btn admin-btn-ghost mt-3 text-xs">
                Ajouter une émission + vidéo
              </Link>
            </div>
          )}
          {live.announced ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/15 bg-black/20 p-3">
              {live.announced.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={live.announced.poster} alt="" className="h-16 w-12 rounded object-cover" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">Prochain invité (en dessous)</p>
                <p className="font-medium">{live.announced.guestName || live.announced.title}</p>
                <p className="text-sm text-[#9aa3b5]">
                  Affiche sous la vidéo. Un nouvel invité archive celui-ci, sans toucher à la vidéo.
                </p>
              </div>
              <StatusBadge status={live.announced.status} />
              <Link href="/admin/arena/prochain-invite" className="admin-btn admin-btn-primary text-xs">
                Modifier l’affiche
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-[#9aa3b5]">Prochain invité</p>
              <p className="mt-1 text-sm text-[#eef1f6]">
                Aucune affiche : l’accueil affiche « {home.spotlight.emptyTitle} » sous la vidéo.
              </p>
              <Link href="/admin/arena/prochain-invite" className="admin-btn admin-btn-primary mt-3 text-xs">
                Annoncer le prochain invité
              </Link>
            </div>
          )}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa3b5]">
          Textes d’attente (seulement s’il n’y a aucune affiche)
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
          <div className="admin-field">
            <label>Puce Émissions</label>
            <input name="chipShows" required defaultValue={home.spotlight.chipShows} />
          </div>
          <div className="admin-field">
            <label>Puce Vidéos</label>
            <input name="chipVideos" required defaultValue={home.spotlight.chipVideos} />
          </div>
          <div className="admin-field">
            <label>Puce Archives</label>
            <input name="chipArchives" required defaultValue={home.spotlight.chipArchives} />
          </div>
          <div className="admin-field">
            <label>Puce Collaborer</label>
            <input name="chipCollab" required defaultValue={home.spotlight.chipCollab} />
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

      <div hidden={active !== "shows"}>
      <SectionForm
        section="shows"
        kicker={home.shows.eyebrow}
        title={home.shows.title}
        hint="Titres de la rangée À (re)découvrir. Les épisodes se gèrent un par un dans Émissions."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="admin-field">
            <label>Sur-titre</label>
            <input name="eyebrow" required defaultValue={home.shows.eyebrow} />
          </div>
          <div className="admin-field">
            <label>Titre</label>
            <input name="title" required defaultValue={home.shows.title} />
          </div>
        </div>
        <LiveTiles
          items={live.shows.map((show) => ({
            href: `/admin/arena/${show.id}`,
            title: show.title,
            image: show.poster,
            meta: "Éditer l’épisode",
          }))}
          empty="Aucune émission publiée hors à la une."
          moreHref="/admin/arena/emissions"
          moreLabel="Toutes les émissions"
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
