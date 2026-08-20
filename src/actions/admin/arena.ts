"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePublic } from "@/lib/cache";
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
import { queueArenaAlert } from "@/lib/arena-alert-dispatch";
import { applyArenaSpotlight, isArenaLiveStatus } from "@/lib/arena-spotlight";
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

export async function saveArenaShow(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const guestIds = formData.getAll("guestIds").map(String).filter(Boolean);

  const parsed = showSchema.safeParse({
    title: formString(formData, "title"),
    number: formInt(formData, "number", 1),
    theme: formString(formData, "theme"),
    description: formString(formData, "description"),
    airDate: formDate(formData, "airDate"),
    airTime: formString(formData, "airTime"),
    venueName: formString(formData, "venueName"),
    eventId: formOptionalId(formData, "eventId"),
    poster: formString(formData, "poster"),
    videoUrl: formString(formData, "videoUrl"),
    videoThumbnail: formString(formData, "videoThumbnail"),
    status: formString(formData, "status") || "DRAFT",
    isFeatured: isArenaLiveStatus(formString(formData, "status") || "DRAFT"),
    isGuestOfWeek: isArenaLiveStatus(formString(formData, "status") || "DRAFT"),
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
  const live = isArenaLiveStatus(data.status);
  const previous = id
    ? await prisma.arenaShow.findUnique({ where: { id }, select: { status: true } })
    : null;

  const payload = {
    title: data.title,
    number: data.number,
    slug,
    theme: data.theme || "",
    description: data.description || "",
    airDate: data.airDate,
    airTime: data.airTime || "",
    venueName: data.venueName || "",
    eventId: data.eventId,
    poster: data.poster || "",
    videoUrl: data.videoUrl || "",
    videoThumbnail: data.videoThumbnail || videoPoster(data.videoUrl),
    status: data.status,
    isFeatured: live,
    isGuestOfWeek: live,
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

  await applyArenaSpotlight(show.id, data.status);
  queueArenaAlert(show.id, previous?.status, data.status);

  revalidatePath("/admin/arena");
  revalidatePath("/admin/arena/emissions");
  revalidatePath("/admin/arena/videos");
  revalidatePath("/admin/arena/archives");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePath("/arena-culture/emissions");
  revalidatePath("/arena-culture/videos");
  revalidatePath("/arena-culture/archives");
  revalidatePath("/arena-culture/affiches");
  revalidatePath("/arena-culture/invites");
  revalidatePublic();
  redirect(`/admin/arena/${show.id}`);
}

export async function deleteArenaShow(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.arenaShow.delete({ where: { id } });
  revalidatePath("/admin/arena");
  revalidatePath("/admin/arena/emissions");
  revalidatePath("/arena-culture");
  revalidatePath("/arena-culture/calendrier");
  revalidatePublic();
  redirect("/admin/arena/emissions");
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
      isFeatured: isArenaLiveStatus(status),
      isGuestOfWeek: isArenaLiveStatus(status),
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
  revalidatePath("/arena-culture/videos");
  revalidatePath("/arena-culture/archives");
  revalidatePublic();
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
  revalidatePublic();
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
  revalidatePublic();
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
  revalidatePublic();
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
  revalidatePublic();
  return { ok: true, message: "Saison enregistrée." };
}

export async function deleteArenaSeason(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.arenaSeason.delete({ where: { id } });
  revalidatePath("/admin/arena/seasons");
}
