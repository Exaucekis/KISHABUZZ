import { applyArenaSpotlight } from "@/lib/arena-spotlight";
import { queueArenaAlert } from "@/lib/arena-alert-dispatch";
import { revalidatePublic } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function publishDueArticles() {
  const now = new Date();
  try {
    const due = await prisma.article.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      select: { id: true, scheduledAt: true },
    });

    if (!due.length) return 0;

    await prisma.$transaction(
      due.map((article) =>
        prisma.article.update({
          where: { id: article.id },
          data: {
            status: "PUBLISHED",
            publishedAt: article.scheduledAt ?? now,
          },
        })
      )
    );

    revalidatePublic();
    return due.length;
  } catch (error) {
    console.error("publishDueArticles skipped", error);
    return 0;
  }
}

export async function publishDueArenaShows() {
  const now = new Date();
  try {
    const due = await prisma.arenaShow.findMany({
      where: {
        status: "SCHEDULED",
        airDate: { lte: now },
      },
      select: { id: true, airDate: true },
    });

    if (!due.length) return 0;

    due.sort((a, b) => (a.airDate?.getTime() || 0) - (b.airDate?.getTime() || 0));
    for (const show of due) {
      await applyArenaSpotlight(show.id, "PUBLISHED");
      queueArenaAlert(show.id, "SCHEDULED", "PUBLISHED");
    }

    revalidatePublic();
    return due.length;
  } catch (error) {
    console.error("publishDueArenaShows skipped", error);
    return 0;
  }
}
