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
import { eventCapacityError, ticketQuantityFloorError } from "@/lib/event-capacity";
import { snapshotEvent, writeEventAudit } from "@/lib/event-audit";
import { deriveEventBounds } from "@/lib/event-schedule";
import { isCinetPayAmount } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { applyEventCancellation } from "@/lib/ticket-lifecycle";
import { createSlug } from "@/lib/utils";

const eventSchema = z.object({
  title: z.string().min(2).max(220),
  summary: z.string().max(400).optional().default(""),
  description: z.string().optional().default(""),
  poster: z.string().optional().default(""),
  startsAt: z.date(),
  endsAt: z.date().nullable().optional(),
  venueName: z.string().max(220).optional().default(""),
  address: z.string().max(300).optional().default(""),
  city: z.string().max(120).optional().default(""),
  categoryId: z.string().nullable().optional(),
  capacity: z.number().int().min(0).optional().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "SOLD_OUT", "ENDED", "CANCELLED"]),
  currency: z.string().min(3).max(3).optional().default("CDF"),
  salesOpensAt: z.date().nullable().optional(),
  salesClosesAt: z.date().nullable().optional(),
  featured: z.boolean(),
});

const ticketTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(120),
  description: z.string().optional().default(""),
  benefits: z.string().optional().default(""),
  price: z.number().int().min(0),
  quantity: z.number().int().min(0),
  maxPerOrder: z.number().int().min(1).max(50).optional().default(6),
  visible: z.boolean().optional().default(true),
  sessionKeys: z.array(z.string()).optional().default([]),
});

async function uniqueEventSlug(base: string, excludeId?: string) {
  const slug = createSlug(base);
  let i = 0;
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await prisma.event.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
  }
}

function parseTicketTypes(raw: string) {
  if (!raw.trim()) return [] as z.infer<typeof ticketTypeSchema>[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        const item = ticketTypeSchema.safeParse({
          id: typeof row?.id === "string" && row.id ? row.id : undefined,
          name: String(row?.name || "").trim(),
          description: String(row?.description || ""),
          benefits: String(row?.benefits || ""),
          price: Number.parseInt(String(row?.price ?? "0"), 10) || 0,
          quantity: Number.parseInt(String(row?.quantity ?? "0"), 10) || 0,
          maxPerOrder: Number.parseInt(String(row?.maxPerOrder ?? "6"), 10) || 6,
          visible: row?.visible !== false && row?.visible !== "0",
          sessionKeys: Array.isArray(row?.sessionKeys)
            ? row.sessionKeys.map((key: unknown) => String(key || "").trim()).filter(Boolean)
            : [],
        });
        return item.success ? item.data : null;
      })
      .filter((row): row is z.infer<typeof ticketTypeSchema> => Boolean(row));
  } catch {
    return [];
  }
}

type SessionDraft = {
  key: string;
  id?: string;
  startsAt: Date;
  endsAt: Date | null;
  access: "PAID" | "FREE";
};

function parseSessions(raw: string): SessionDraft[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const items: SessionDraft[] = [];
    for (const row of parsed) {
      const startsAt = row?.startsAt ? new Date(String(row.startsAt)) : null;
      if (!startsAt || Number.isNaN(startsAt.getTime())) continue;
      const endsRaw = row?.endsAt ? new Date(String(row.endsAt)) : null;
      const endsAt = endsRaw && !Number.isNaN(endsRaw.getTime()) ? endsRaw : null;
      items.push({
        key: String(row?.key || row?.id || `tmp-${items.length}`),
        id: typeof row?.id === "string" && row.id && !row.id.startsWith("tmp-") ? row.id : undefined,
        startsAt,
        endsAt,
        access: row?.access === "FREE" ? "FREE" : "PAID",
      });
    }
    return items.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  } catch {
    return [];
  }
}

type GalleryItem = { id?: string; url: string };

function parseGallery(raw: string): GalleryItem[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const items: GalleryItem[] = [];
    for (const row of parsed) {
      const url = String(row?.url || "").trim();
      if (!url) continue;
      const id = typeof row?.id === "string" && row.id ? row.id : undefined;
      items.push({ id, url });
    }
    return items;
  } catch {
    return [];
  }
}

function revalidateEvents(slug?: string) {
  revalidatePath("/admin/evenements");
  revalidatePath("/admin");
  revalidatePath("/evenements");
  if (slug) revalidatePath(`/evenements/${slug}`);
  revalidatePublic();
}

export async function saveEvent(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await requireAdmin();
  const id = formOptionalId(formData, "id");
  const ticketTypes = parseTicketTypes(formString(formData, "ticketTypes"));
  const gallery = parseGallery(formString(formData, "gallery"));
  const sessions = parseSessions(formString(formData, "sessions"));
  const organizerId = formOptionalId(formData, "organizerId");
  const bounds = deriveEventBounds(sessions);

  const parsed = eventSchema.safeParse({
    title: formString(formData, "title"),
    summary: formString(formData, "summary"),
    description: formString(formData, "description"),
    poster: formString(formData, "poster"),
    startsAt: bounds?.startsAt || formDate(formData, "startsAt"),
    endsAt: bounds?.endsAt || formDate(formData, "endsAt"),
    venueName: formString(formData, "venueName"),
    address: formString(formData, "address"),
    city: formString(formData, "city"),
    categoryId: formOptionalId(formData, "categoryId"),
    capacity: formInt(formData, "capacity", 0),
    status: formString(formData, "status") || "DRAFT",
    currency: formString(formData, "currency") || "CDF",
    salesOpensAt: formDate(formData, "salesOpensAt"),
    salesClosesAt: formDate(formData, "salesClosesAt"),
    featured: formBool(formData, "featured"),
  });

  if (!parsed.success || !parsed.data.startsAt || !sessions.length) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire (titre et au moins une journée avec date et heure).",
      fieldErrors: parsed.success
        ? undefined
        : (parsed.error.flatten().fieldErrors as Record<string, string[]>),
    };
  }

  const paidSessionKeys = sessions.filter((session) => session.access === "PAID").map((session) => session.key);
  if (parsed.data.status === "PUBLISHED" && ticketTypes.some((type) => type.visible !== false) && !paidSessionKeys.length) {
    return {
      ok: false,
      message: "Pour vendre des billets, au moins une journée doit être payante. Sinon passez toutes les journées en entrée libre et retirez les tarifs.",
    };
  }

  const invalidPrice = ticketTypes.find((type) => type.price > 0 && !isCinetPayAmount(type.price));
  if (invalidPrice) {
    return {
      ok: false,
      message: `Le prix « ${invalidPrice.name} » doit être un multiple de 5 (exigence CinetPay).`,
    };
  }

  let takenSeats = 0;
  const previous = id
    ? await prisma.event.findUnique({
        where: { id },
        include: {
          ticketTypes: {
            select: { id: true, name: true, quantity: true, soldCount: true, reservedCount: true, price: true },
          },
        },
      })
    : null;
  if (previous) {
    const currentById = new Map(previous.ticketTypes.map((type) => [type.id, type]));
    takenSeats = ticketTypes.reduce((sum, type) => {
      const existing = type.id ? currentById.get(type.id) : undefined;
      return sum + (existing ? existing.soldCount + existing.reservedCount : 0);
    }, 0);
  }

  const capacityMessage = eventCapacityError({
    capacity: parsed.data.capacity || 0,
    status: parsed.data.status,
    quantities: ticketTypes.map((type) => type.quantity),
    takenSeats,
  });
  if (capacityMessage) {
    return { ok: false, message: capacityMessage };
  }

  if (organizerId) {
    const organizer = await prisma.user.findUnique({ where: { id: organizerId }, select: { id: true } });
    if (!organizer) return { ok: false, message: "Organisateur introuvable." };
  }

  const data = parsed.data;
  const goingCancelled = data.status === "CANCELLED" && previous?.status !== "CANCELLED";
  const slug = await uniqueEventSlug(data.title, id || undefined);
  const payload = {
    title: data.title,
    slug,
    summary: data.summary || "",
    description: data.description || "",
    poster: data.poster || "",
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    venueName: data.venueName || "",
    address: data.address || "",
    city: data.city || "",
    categoryId: data.categoryId,
    capacity: data.capacity || 0,
    status: goingCancelled ? previous?.status || "DRAFT" : data.status,
    currency: "CDF",
    salesOpensAt: data.salesOpensAt,
    salesClosesAt: data.salesClosesAt,
    featured: data.featured,
  };

  let event;
  try {
    event = await prisma.$transaction(async (tx) => {
    const saved = id
      ? await tx.event.update({
          where: { id },
          data: {
            ...payload,
            ...(organizerId ? { organizerId } : {}),
          },
        })
      : await tx.event.create({
          data: { ...payload, organizerId: organizerId || session.user.id },
        });

    const keyToSessionId = new Map<string, string>();
    const keepSessionIds: string[] = [];
    for (const [index, day] of sessions.entries()) {
      const sessionData = {
        startsAt: day.startsAt,
        endsAt: day.endsAt,
        access: day.access,
        sortOrder: index,
        label: day.access === "FREE" ? "Entrée libre" : "",
      };
      if (day.id) {
        const existing = await tx.eventSession.findFirst({
          where: { id: day.id, eventId: saved.id },
        });
        if (existing) {
          await tx.eventSession.update({ where: { id: existing.id }, data: sessionData });
          keyToSessionId.set(day.key, existing.id);
          keepSessionIds.push(existing.id);
          continue;
        }
      }
      const created = await tx.eventSession.create({
        data: { ...sessionData, eventId: saved.id },
      });
      keyToSessionId.set(day.key, created.id);
      keepSessionIds.push(created.id);
    }
    await tx.eventSession.deleteMany({
      where: { eventId: saved.id, ...(keepSessionIds.length ? { id: { notIn: keepSessionIds } } : {}) },
    });

    const keepIds: string[] = [];
    const typeLinks: { id: string; sessionKeys: string[] }[] = [];
    for (const [index, type] of ticketTypes.entries()) {
      const typeData = {
        name: type.name,
        description: type.description || "",
        benefits: type.benefits || "",
        price: type.price,
        quantity: type.quantity,
        maxPerOrder: type.maxPerOrder || 6,
        visible: type.visible !== false,
        sortOrder: index,
      };
      if (type.id) {
        const existing = await tx.ticketType.findFirst({
          where: { id: type.id, eventId: saved.id },
        });
        if (!existing) continue;
        const floor = ticketQuantityFloorError(
          existing.name,
          type.quantity,
          existing.soldCount,
          existing.reservedCount
        );
        if (floor) throw new Error(floor);
        await tx.ticketType.update({ where: { id: existing.id }, data: typeData });
        keepIds.push(existing.id);
        typeLinks.push({ id: existing.id, sessionKeys: type.sessionKeys || [] });
      } else {
        const created = await tx.ticketType.create({
          data: { ...typeData, eventId: saved.id },
        });
        keepIds.push(created.id);
        typeLinks.push({ id: created.id, sessionKeys: type.sessionKeys || [] });
      }
    }

    const removable = await tx.ticketType.findMany({
      where: { eventId: saved.id, id: { notIn: keepIds } },
      select: { id: true, soldCount: true, reservedCount: true, name: true },
    });
    const locked = removable.find((type) => type.soldCount + type.reservedCount > 0);
    if (locked) {
      throw new Error(
        `Impossible de retirer « ${locked.name} » : des places sont déjà vendues ou réservées.`
      );
    }
    if (removable.length) {
      await tx.ticketType.deleteMany({ where: { id: { in: removable.map((type) => type.id) } } });
    }

    for (const link of typeLinks) {
      const keys = link.sessionKeys.length
        ? link.sessionKeys.filter((key) => paidSessionKeys.includes(key))
        : paidSessionKeys;
      const sessionIds = [...new Set(keys.map((key) => keyToSessionId.get(key)).filter(Boolean))] as string[];
      await tx.ticketTypeSession.deleteMany({ where: { ticketTypeId: link.id } });
      if (sessionIds.length) {
        await tx.ticketTypeSession.createMany({
          data: sessionIds.map((sessionId) => ({ ticketTypeId: link.id, sessionId })),
        });
      }
    }

    const keepMediaIds: string[] = [];
    for (const item of gallery) {
      if (item.id) {
        const existing = await tx.mediaAsset.findFirst({
          where: { id: item.id, eventId: saved.id },
        });
        if (!existing) continue;
        await tx.mediaAsset.update({
          where: { id: existing.id },
          data: { url: item.url, title: saved.title, kind: "IMAGE" },
        });
        keepMediaIds.push(existing.id);
      } else {
        const created = await tx.mediaAsset.create({
          data: {
            title: saved.title,
            url: item.url,
            kind: "IMAGE",
            category: "EVENEMENTS",
            eventId: saved.id,
          },
        });
        keepMediaIds.push(created.id);
      }
    }
    await tx.mediaAsset.updateMany({
      where: {
        eventId: saved.id,
        ...(keepMediaIds.length ? { id: { notIn: keepMediaIds } } : {}),
      },
      data: { eventId: null },
    });

    if (goingCancelled || (!previous && data.status === "CANCELLED")) {
      await applyEventCancellation(tx, saved.id, session.user.id);
    } else {
      await writeEventAudit(tx, {
        eventId: saved.id,
        actorId: session.user.id,
        action: previous ? "EVENT_UPDATED" : "EVENT_CREATED",
        summary: previous
          ? `Enregistré · ${data.status} · capacité ${data.capacity}`
          : `Créé · ${data.title}`,
        beforeJson: previous ? snapshotEvent(previous) : "",
        afterJson: snapshotEvent({
          title: data.title,
          status: data.status,
          capacity: data.capacity,
          ticketTypes: ticketTypes.map((type) => ({
            name: type.name,
            quantity: type.quantity,
            soldCount: type.id
              ? previous?.ticketTypes.find((row) => row.id === type.id)?.soldCount || 0
              : 0,
            reservedCount: type.id
              ? previous?.ticketTypes.find((row) => row.id === type.id)?.reservedCount || 0
              : 0,
            price: type.price,
          })),
        }),
      });
    }

    return saved;
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Impossible d’enregistrer l’événement.",
    };
  }

  revalidateEvents(event.slug);
  redirect(`/admin/evenements/${event.id}`);
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  const orders = await prisma.ticketOrder.count({ where: { eventId: id } });
  if (orders) return;
  const event = await prisma.event.delete({ where: { id } });
  revalidateEvents(event.slug);
  redirect("/admin/evenements");
}

const EVENT_STATUS = new Set(["DRAFT", "PUBLISHED", "SOLD_OUT", "ENDED", "CANCELLED"]);

export async function setEventStatus(formData: FormData) {
  const session = await requireAdmin();
  const id = formString(formData, "id");
  const status = formString(formData, "status");
  if (!id || !EVENT_STATUS.has(status)) return;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      ticketTypes: {
        select: { name: true, quantity: true, soldCount: true, reservedCount: true, price: true },
      },
    },
  });
  if (!event) return;

  if (status === "CANCELLED") {
    await prisma.$transaction(async (tx) => {
      await applyEventCancellation(tx, id, session.user.id);
    });
    revalidateEvents(event.slug);
    return;
  }

  const capacityMessage = eventCapacityError({
    capacity: event.capacity,
    status,
    quantities: event.ticketTypes.map((type) => type.quantity),
    takenSeats: event.ticketTypes.reduce((sum, type) => sum + type.soldCount + type.reservedCount, 0),
  });
  if (capacityMessage) {
    redirect(`/admin/evenements/${event.id}?notice=${encodeURIComponent(capacityMessage)}`);
  }
  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.event.update({ where: { id }, data: { status } });
    await writeEventAudit(tx, {
      eventId: id,
      actorId: session.user.id,
      action: "STATUS_CHANGED",
      summary: `Statut ${event.status} → ${status}`,
      beforeJson: snapshotEvent(event),
      afterJson: snapshotEvent({ ...event, status }),
    });
    return next;
  });
  revalidateEvents(updated.slug);
}

const categorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().optional().default(""),
  visible: z.boolean(),
});

export async function saveEventCategory(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = categorySchema.safeParse({
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    visible: formBool(formData, "visible"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Nom de catégorie trop court." };
  }
  let slug = createSlug(parsed.data.name);
  const clash = await prisma.eventCategory.findUnique({ where: { slug } });
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36)}`;

  const payload = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description || "",
    visible: parsed.data.visible,
  };
  if (id) await prisma.eventCategory.update({ where: { id }, data: payload });
  else {
    const last = await prisma.eventCategory.aggregate({ _max: { order: true } });
    await prisma.eventCategory.create({
      data: { ...payload, order: (last._max.order ?? 0) + 1 },
    });
  }
  revalidatePath("/admin/evenements");
  revalidatePath("/admin/evenements/categories");
  revalidatePath("/evenements");
  return { ok: true, message: "Catégorie enregistrée." };
}

export async function deleteEventCategory(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  const used = await prisma.event.count({ where: { categoryId: id } });
  if (used) return;
  await prisma.eventCategory.delete({ where: { id } });
  revalidatePath("/admin/evenements/categories");
  revalidatePath("/evenements");
}
