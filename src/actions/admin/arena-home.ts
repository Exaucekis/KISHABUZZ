"use server";

import { revalidatePath } from "next/cache";
import { formString, requireAdmin, type AdminActionState } from "@/lib/admin";
import {
  ARENA_HOME_KEY,
  ARENA_HOME_SECTION_META,
  ARENA_HOME_SECTIONS,
  applyArenaHomeSection,
  collectReplacedImages,
  parseArenaHome,
  patchArenaHomeFromForm,
  type ArenaHomeSection,
} from "@/lib/arena-home";
import { applyPublicWrites } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

function isSection(value: string): value is ArenaHomeSection {
  return (ARENA_HOME_SECTIONS as readonly string[]).includes(value);
}

export async function saveArenaHomeSection(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const section = formString(formData, "section");
  if (!isSection(section)) {
    return { ok: false, message: "Rubrique inconnue." };
  }

  try {
    const [row, presentation] = await Promise.all([
      prisma.pageContent.findUnique({ where: { key: ARENA_HOME_KEY } }),
      prisma.pageContent.findUnique({ where: { key: "arena.presentation" } }),
    ]);
    const current = parseArenaHome(row?.body, presentation?.body);
    const drafted = applyArenaHomeSection(
      current,
      section,
      patchArenaHomeFromForm(section, current, formData)
    );
    const next = parseArenaHome(JSON.stringify(drafted), drafted.hero.text || presentation?.body || "");
    const replaced = collectReplacedImages(current, next);

    await prisma.$transaction(async (tx) => {
      await tx.pageContent.upsert({
        where: { key: ARENA_HOME_KEY },
        create: {
          key: ARENA_HOME_KEY,
          title: "Arena Culture — Accueil",
          body: JSON.stringify(next, null, 2),
        },
        update: { body: JSON.stringify(next, null, 2) },
      });

      if (section === "hero") {
        await tx.pageContent.upsert({
          where: { key: "arena.presentation" },
          create: { key: "arena.presentation", title: "Arena Culture", body: next.hero.text },
          update: { body: next.hero.text },
        });
      }

      for (const image of replaced) {
        const existing = await tx.mediaAsset.findFirst({
          where: { url: image.url, category: "ARENA_CULTURE" },
        });
        if (existing) continue;
        await tx.mediaAsset.create({
          data: {
            title: `Archive · ${image.title}`,
            description: "Ancien visuel de la page Arena Culture — conservé pour rediffusion.",
            kind: "IMAGE",
            url: image.url,
            thumbnail: image.url,
            alt: image.title,
            category: "ARENA_CULTURE",
            visible: true,
            date: new Date(),
          },
        });
      }
    });

    revalidatePath("/admin/arena");
    revalidatePath("/admin/media");
    revalidatePath("/arena-culture", "layout");
    revalidatePath("/arena-culture/affiches");
    revalidatePath("/arena-culture/archives");
    revalidatePath("/");
    applyPublicWrites();

    const meta = ARENA_HOME_SECTION_META[section];
    const archived = replaced.length
      ? ` ${replaced.length} visuel${replaced.length > 1 ? "s" : ""} envoyé${replaced.length > 1 ? "s" : ""} aux archives.`
      : "";
    return {
      ok: true,
      message: `Rubrique « ${meta.label} » enregistrée. Elle s’affiche maintenant sur ${meta.where}.${archived}`,
    };
  } catch (error) {
    console.error("saveArenaHomeSection", error);
    return {
      ok: false,
      message: `Impossible d’enregistrer la rubrique « ${ARENA_HOME_SECTION_META[section].label} » : la base est injoignable. Réessaie, ou enregistre depuis l’admin en ligne.`,
    };
  }
}
