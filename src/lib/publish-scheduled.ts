import { revalidatePublic } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function publishDueArticles() {
  const now = new Date();
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
}
