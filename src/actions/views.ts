"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isBotUserAgent, type ViewKind } from "@/lib/page-views";

export async function recordPageView(kind: ViewKind, id: string) {
  const ua = (await headers()).get("user-agent");
  if (isBotUserAgent(ua) || !id) return { ok: false as const };

  if (kind === "article") {
    const article = await prisma.article.findFirst({
      where: { id, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!article) return { ok: false as const };
    await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return { ok: true as const };
  }

  const show = await prisma.arenaShow.findFirst({
    where: { id, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!show) return { ok: false as const };
  await prisma.arenaShow.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
  return { ok: true as const };
}
