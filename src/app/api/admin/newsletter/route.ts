import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { subscribersToCsv } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const rows = await prisma.newsletterSubscriber.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: { email: true, status: true, createdAt: true },
  });

  return new NextResponse(subscribersToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kishabuzz-newsletter.csv"',
    },
  });
}
