"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { applyPublicWrites } from "@/lib/cache";
import {
  formBool,
  formDate,
  formInt,
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";
import { snapshotArenaMedia, snapshotShowForArchive } from "@/lib/arena-archive";
import { queueArenaAlert } from "@/lib/arena-alert-dispatch";
import { applyArenaSpotlight } from "@/lib/arena-spotlight";
import { formatEventClock } from "@/lib/event-schedule";
import { videoPoster } from "@/lib/media";

const showSchema = z.object({
  title: z.string().min(2).max(220),
  number: z.number().int().min(1),
  theme: z.string().max(220).optional().default(""),
  description: z.string().optional().default(""),
  airDate: z.date().nullable().optional(),
  airTime: z.string().max(40).optional().default(""),
  venueName: z.string().max(220).optional().default(""),
  eventId: z.string().nullable().optional(),
  poster: z.string().optional().default(""),
  videoUrl: z.string().optional().default(""),
  videoThumbnail: z.string().optional().default(""),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean(),
  isGuestOfWeek: z.boolean(),
  seasonId: z.string().nullable().optional(),
  guestIds: z.array(z.string()).optional().default([]),
});

async function uniqueShowSlug(base: string, excludeId?: string) {
  const slug = createSlug(base);
  let i = 0;
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await prisma.arenaShow.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
  }
}

async function resolveShowGuestIds(guestName: string, domain: string, existingIds: string[]) {
  if (existingIds.length) return existingIds;
  const name = guestName.trim();
  if (!name) return [];
  const existing = await prisma.arenaGuest.findFirst({
    where: { name },
    select: { id: true, profession: true },
  });
  if (existing) {
    if (domain && !existing.profession) {
      await prisma.arenaGuest.update({
        where: { id: existing.id },
        data: { profession: domain },
      });
    }
    return [existing.id];
  }
  let slug = createSlug(name) || `invite-${Date.now().toString(36)}`;
  const clash = await prisma.arenaGuest.findUnique({ where: { slug }, select: { id: true } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;
  const created = await prisma.arenaGuest.create({
    data: { name, slug, profession: domain, visible: true },
  });
  return [created.id];
}

export async function saveArenaShow(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const guestName = formString(formData, "guestName");
  const domain = formString(formData, "theme");
  const title = formString(formData, "title") || guestName;
  const videoUrl = formString(formData, "videoUrl");
  if (!videoUrl) {
    return { ok: false, message: "Ajoutez la vidéo de l’émission." };
  }
  if (!guestName && !formString(formData, "title")) {
    return { ok: false, message: "Indiquez le nom de l’invité." };
  }

  const selectedGuestIds = Array.from(
    new Set(formData.getAll("guestIds").map(String).filter(Boolean))
  );
  const guestIds = await resolveShowGuestIds(guestName, domain, selectedGuestIds);

  let number = formInt(formData, "number", 0);
  if (!number) {
    const last = await prisma.arenaShow.aggregate({ _max: { number: true } });
    number = (last._max.number || 0) + 1;
  }

  const parsed = showSchema.safeParse({
    title,
    number,
    theme: domain,
    description: formString(formData, "description"),
    venueName: formString(formData, "venueName"),
    eventId: formOptionalId(formData, "eventId"),
    poster: formString(formData, "poster"),
    videoUrl,
    videoThumbnail: formString(formData, "videoThumbnail"),
    status: formString(formData, "status") || "PUBLISHED",
    isFeatured: true,
    isGuestOfWeek: false,
    seasonId: formOptionalId(formData, "seasonId"),
    guestIds,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const slug = await uniqueShowSlug(`${data.title}-${data.number}`, id || undefined);
  const hasVideo = Boolean(String(data.videoUrl || "").trim());
  const status = hasVideo && data.status === "SCHEDULED" ? "PUBLISHED" : data.status;
  const previous = id
    ? await prisma.arenaShow.findUnique({
        where: { id },
        select: {
          status: true,
          title: true,
          videoUrl: true,
          videoThumbnail: true,
          poster: true,
          airDate: true,
          airTime: true,
        },
      })
    : null;

  const launchedAt = new Date();
  const goingLive = status === "PUBLISHED";
  const airDate = goingLive ? previous?.airDate || launchedAt : previous?.airDate || null;
  const airTime = goingLive
    ? previous?.airTime || formatEventClock(launchedAt)
    : previous?.airTime || "";

  const payload = {
    title: data.title,
    number: data.number,
    slug,
    theme: data.theme || "",
    description: data.description || "",
    airDate,
    airTime,
    venueName: data.venueName || "",
    eventId: data.eventId,
    poster: data.poster || "",
    videoUrl: data.videoUrl || "",
    videoThumbnail: data.videoThumbnail || videoPoster(data.videoUrl),
    status,
    isFeatured: status === "PUBLISHED",
    isGuestOfWeek: status === "SCHEDULED",
    seasonId: data.seasonId,
  };

  const show = await prisma.$transaction(async (tx) => {
    const saved = id
      ? await tx.arenaShow.update({ where: { id }, data: payload })
      : await tx.arenaShow.create({ data: payload });

    await tx.arenaShowGuest.deleteMany({ where: { showId: saved.id } });
    if (data.guestIds.length) {
      await tx.arenaShowGuest.createMany({
        data: data.guestIds.map((guestId) => ({ showId: saved.id, guestId })),
      });
    }
    return saved;
  });

  if (previous?.videoUrl && previous.videoUrl !== payload.videoUrl) {
    await snapshotArenaMedia({
      title: previous.title,
      kind: "VIDEO",
      url: previous.videoUrl,
      thumbnail: previous.videoThumbnail,
    });
  }
  if (previous?.videoThumbnail && previous.videoThumbnail !== payload.videoThumbnail) {
    await snapshotArenaMedia({
      title: `${previous.title} · miniature`,
      kind: "IMAGE",
      url: previous.videoThumbnail,
    });
  }
  if (previous?.poster && previous.poster !== payload.poster) {
    await snapshotArenaMedia({
      title: previous.title,
      kind: "IMAGE",
      url: previous.poster,
    });
  }

  if (payload.videoUrl) {
    const existingVideo = await prisma.mediaAsset.findFirst({
      where: { arenaShowId: show.id, kind: "VIDEO" },
      select: { id: true },
    });
    const videoData = {
      title: show.title,
      description: show.theme || show.description || "",
      kind: "VIDEO" as const,
      url: payload.videoUrl,
      thumbnail: payload.videoThumbnail,
      category: "ARENA_CULTURE",
      visible: true,
      arenaShowId: show.id,
    };
    if (existingVideo) {
      await prisma.mediaAsset.update({ where: { id: existingVideo.id }, data: videoData });
    } else {
      await prisma.mediaAsset.create({ data: videoData });
    }
  }

  await applyArenaSpotlight(show.id, status);
  queueArenaAlert(show.id, previous?.status, status);

  revalidatePath("/admin/arena");
  revalidatePath("/admin/arena/prochain-invite");
  revalidatePath("/admin/arena/emissions");
  revalidatePath("/admin/arena/guests");
  revalidatePath("/admin/arena/archives");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePath("/arena-culture/emissions");
  revalidatePath("/arena-culture/archives");
  revalidatePath("/arena-culture/affiches");
  revalidatePath("/arena-culture/invites");
  revalidatePath("/");
  applyPublicWrites();
  redirect("/admin/arena/emissions");
}

export async function archiveArenaShow(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  const current = await prisma.arenaShow.findUnique({
    where: { id },
    select: { status: true, title: true, videoUrl: true, videoThumbnail: true, poster: true },
  });
  if (current) await snapshotShowForArchive(current);
  await prisma.arenaShow.update({
    where: { id },
    data: { status: "ARCHIVED", isFeatured: false, isGuestOfWeek: false },
  });
  await applyArenaSpotlight(id, "ARCHIVED");
  queueArenaAlert(id, current?.status, "ARCHIVED");
  revalidatePath("/admin/arena");
  revalidatePath("/admin/arena/emissions");
  revalidatePath("/admin/arena/archives");
  revalidatePath("/admin/arena/prochain-invite");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/emissions");
  revalidatePath("/arena-culture/archives");
  revalidatePath("/arena-culture/affiches");
  revalidatePath("/");
  applyPublicWrites();
  redirect(formString(formData, "next") || "/admin/arena/archives");
}

export async function deleteArenaShow(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.arenaShow.delete({ where: { id } });
  revalidatePath("/admin/arena");
  revalidatePath("/admin/arena/emissions");
  revalidatePath("/admin/arena/archives");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePath("/arena-culture/archives");
  revalidatePath("/");
  applyPublicWrites();
  redirect(formString(formData, "next") || "/admin/arena/archives");
}

export async function setArenaShowStatus(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const status = formString(formData, "status");
  if (!id || !status) return;
  const current = await prisma.arenaShow.findUnique({ where: { id }, select: { status: true } });
  await prisma.arenaShow.update({
    where: { id },
    data: {
      status,
      isFeatured: status === "PUBLISHED",
      isGuestOfWeek: status === "SCHEDULED",
    },
  });
  await applyArenaSpotlight(id, status);
  queueArenaAlert(id, current?.status, status);
  revalidatePath("/admin/arena");
  revalidatePath("/admin/arena/emissions");
  revalidatePath("/admin/arena/archives");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePath("/arena-culture/emissions");
  revalidatePath("/arena-culture/archives");
  revalidatePath("/");
  applyPublicWrites();
}

export async function announceNextGuest(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const guestId = formString(formData, "guestId");
  const mode = formString(formData, "mode") || "replace";
  const currentId = formOptionalId(formData, "id");
  const theme = formString(formData, "theme");
  const poster = formString(formData, "poster");
  const airDate = formDate(formData, "airDate");
  const airTime = formString(formData, "airTime");

  if (!guestId) {
    return { ok: false, message: "Choisissez un invité à annoncer." };
  }

  const guest = await prisma.arenaGuest.findUnique({ where: { id: guestId } });
  if (!guest) {
    return { ok: false, message: "Cet invité n’existe pas." };
  }

  const existing =
    mode === "update" && currentId
      ? await prisma.arenaShow.findUnique({
          where: { id: currentId },
          select: { id: true, status: true, number: true, slug: true },
        })
      : null;
  const updateExisting = Boolean(existing);

  if (mode === "update" && currentId && !existing) {
    return { ok: false, message: "Annonce introuvable. Créez-en une nouvelle." };
  }

  const previousPoster = currentId
    ? await prisma.arenaShow.findUnique({
        where: { id: currentId },
        select: { poster: true, title: true },
      })
    : null;

  const last = await prisma.arenaShow.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const number = existing?.number || (last?.number || 0) + 1;
  const slug = existing?.slug || (await uniqueShowSlug(`${guest.name}-${number}`));
  const payload = {
    title: guest.name,
    number,
    slug,
    theme: theme || guest.profession || "",
    poster: poster || guest.photo || "",
    airDate,
    airTime: airTime || "",
    status: "SCHEDULED" as const,
    isFeatured: true,
    isGuestOfWeek: true,
  };

  const show = await prisma.$transaction(async (tx) => {
    await tx.arenaGuest.update({
      where: { id: guestId },
      data: { visible: true },
    });

    const saved = updateExisting
      ? await tx.arenaShow.update({ where: { id: currentId! }, data: payload })
      : await tx.arenaShow.create({ data: payload });

    await tx.arenaShowGuest.deleteMany({ where: { showId: saved.id } });
    await tx.arenaShowGuest.create({ data: { showId: saved.id, guestId } });
    return saved;
  });

  await applyArenaSpotlight(show.id, "SCHEDULED");
  if (previousPoster?.poster && previousPoster.poster !== payload.poster) {
    await snapshotArenaMedia({
      title: previousPoster.title,
      kind: "IMAGE",
      url: previousPoster.poster,
    });
  }
  queueArenaAlert(show.id, existing?.status, "SCHEDULED");

  revalidatePath("/admin/arena");
  revalidatePath("/admin/arena/prochain-invite");
  revalidatePath("/admin/arena/emissions");
  revalidatePath("/admin/arena/archives");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePath("/arena-culture/emissions");
  revalidatePath("/arena-culture/invites");
  revalidatePath("/");
  applyPublicWrites();
  return {
    ok: true,
    message: updateExisting
      ? `${guest.name} est à jour : Prochain invité est en ligne sur l’accueil.`
      : `${guest.name} est annoncé : Prochain invité s’affiche maintenant sur l’accueil.`,
  };
}

const guestSchema = z.object({
  name: z.string().min(2).max(160),
  profession: z.string().max(160).optional().default(""),
  bio: z.string().optional().default(""),
  photo: z.string().optional().default(""),
  visible: z.boolean(),
  featured: z.boolean(),
});

export async function saveArenaGuest(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = guestSchema.safeParse({
    name: formString(formData, "name"),
    profession: formString(formData, "profession"),
    bio: formString(formData, "bio"),
    photo: formString(formData, "photo"),
    visible: formBool(formData, "visible"),
    featured: formBool(formData, "featured"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let slug = createSlug(parsed.data.name);
  const clash = await prisma.arenaGuest.findUnique({ where: { slug } });
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36)}`;

  const payload = {
    name: parsed.data.name,
    slug,
    profession: parsed.data.profession || "",
    bio: parsed.data.bio || "",
    photo: parsed.data.photo || "",
    visible: parsed.data.visible,
    featured: parsed.data.featured,
  };

  if (id) await prisma.arenaGuest.update({ where: { id }, data: payload });
  else await prisma.arenaGuest.create({ data: payload });

  revalidatePath("/admin/arena/guests");
  revalidatePath("/arena-culture/invites");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePath("/");
  applyPublicWrites();
  return { ok: true, message: "Invité enregistré." };
}

export async function setArenaGuestVisible(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const visible = formString(formData, "visible") === "1";
  if (!id) return;
  await prisma.arenaGuest.update({ where: { id }, data: { visible } });
  revalidatePath("/admin/arena/guests");
  revalidatePath("/admin");
  revalidatePath("/arena-culture/invites");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePath("/");
  applyPublicWrites();
}

export async function deleteArenaGuest(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.arenaGuest.delete({ where: { id } });
  revalidatePath("/admin/arena/guests");
  revalidatePath("/arena-culture/invites");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePath("/");
  applyPublicWrites();
}

const seasonSchema = z.object({
  number: z.number().int().min(1),
  title: z.string().min(2).max(160),
  year: z.number().int().min(2000).max(2100),
  description: z.string().optional().default(""),
});

export async function saveArenaSeason(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = seasonSchema.safeParse({
    number: formInt(formData, "number", 1),
    title: formString(formData, "title"),
    year: formInt(formData, "year", new Date().getFullYear()),
    description: formString(formData, "description"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const payload = {
    number: parsed.data.number,
    title: parsed.data.title,
    year: parsed.data.year,
    description: parsed.data.description || "",
  };

  if (id) await prisma.arenaSeason.update({ where: { id }, data: payload });
  else await prisma.arenaSeason.create({ data: payload });

  revalidatePath("/admin/arena/seasons");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePath("/");
  applyPublicWrites();
  return { ok: true, message: "Saison enregistrée." };
}

export async function deleteArenaSeason(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.arenaSeason.delete({ where: { id } });
  revalidatePath("/admin/arena/seasons");
}
