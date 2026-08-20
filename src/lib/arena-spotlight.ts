export const ARENA_LIVE_STATUSES = ["SCHEDULED", "PUBLISHED"] as const;

export type ArenaShowSpotlightRow = {
  id: string;
  status: string;
  isFeatured: boolean;
  isGuestOfWeek: boolean;
};

export type ArenaSpotlightMode = "headline" | "announced" | "empty";

export function isArenaLiveStatus(status: string) {
  return status === "PUBLISHED" || status === "SCHEDULED";
}

export function arenaSpotlightMode(
  show: { status: string; videoUrl?: string | null; airDate?: Date | null } | null,
  now = new Date()
): ArenaSpotlightMode {
  if (!show || show.status === "DRAFT") return "empty";
  if (show.status === "SCHEDULED" || show.status === "ARCHIVED") return "announced";
  if (show.airDate && show.airDate > now && !String(show.videoUrl || "").trim()) return "announced";
  return "headline";
}

export function arenaSpotlightGuest<T extends { visible?: boolean | null }>(
  show: { guests?: Array<{ guest: T | null | undefined }> } | null | undefined
): T | null {
  const guests = (show?.guests || [])
    .map((row) => row.guest)
    .filter((guest): guest is T => Boolean(guest));
  return guests.find((guest) => guest.visible !== false) || guests[0] || null;
}

export function planArenaSpotlight(
  rows: ArenaShowSpotlightRow[],
  promotingId: string,
  nextStatus: string
): ArenaShowSpotlightRow[] {
  const live = isArenaLiveStatus(nextStatus);
  return rows.map((row) => {
    if (row.id === promotingId) {
      return {
        id: row.id,
        status: nextStatus,
        isFeatured: live,
        isGuestOfWeek: live,
      };
    }
    if (!live) return row;
    if (row.isFeatured || row.isGuestOfWeek) {
      return {
        id: row.id,
        status: "ARCHIVED",
        isFeatured: false,
        isGuestOfWeek: false,
      };
    }
    return row;
  });
}

export async function applyArenaSpotlight(showId: string, nextStatus: string) {
  const { prisma } = await import("@/lib/prisma");
  const current = await prisma.arenaShow.findMany({
    where: {
      OR: [{ id: showId }, { isFeatured: true }, { isGuestOfWeek: true }],
    },
    select: { id: true, status: true, isFeatured: true, isGuestOfWeek: true },
  });
  if (!current.some((row) => row.id === showId)) {
    current.push({
      id: showId,
      status: nextStatus,
      isFeatured: false,
      isGuestOfWeek: false,
    });
  }

  const planned = planArenaSpotlight(current, showId, nextStatus);
  const changed = planned.filter((row) => {
    const before = current.find((item) => item.id === row.id);
    return (
      !before ||
      before.status !== row.status ||
      before.isFeatured !== row.isFeatured ||
      before.isGuestOfWeek !== row.isGuestOfWeek
    );
  });

  await prisma.$transaction(async (tx) => {
    for (const row of changed) {
      await tx.arenaShow.update({
        where: { id: row.id },
        data: {
          status: row.status,
          isFeatured: row.isFeatured,
          isGuestOfWeek: row.isGuestOfWeek,
        },
      });
    }

    if (isArenaLiveStatus(nextStatus)) {
      await tx.mediaAsset.updateMany({
        where: { featured: true, kind: "VIDEO" },
        data: { featured: false },
      });
      await tx.mediaAsset.updateMany({
        where: { arenaShowId: showId, kind: "VIDEO", visible: true },
        data: { featured: true },
      });
      const guests = await tx.arenaShowGuest.findMany({
        where: { showId },
        select: { guestId: true },
      });
      await tx.arenaGuest.updateMany({ where: { featured: true }, data: { featured: false } });
      if (guests.length) {
        await tx.arenaGuest.updateMany({
          where: { id: { in: guests.map((item) => item.guestId) } },
          data: { featured: true },
        });
      }
    }
  });
}
