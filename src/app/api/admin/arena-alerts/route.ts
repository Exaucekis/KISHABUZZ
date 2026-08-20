import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { csvEscape } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function alertsToCsv(
  rows: {
    email: string | null;
    emailStatus: string;
    whatsapp: string;
    whatsappStatus: string;
    source: string;
    createdAt: Date;
  }[]
) {
  const header = "email,email_statut,whatsapp,whatsapp_statut,source,inscrit_le";
  const lines = rows.map((row) =>
    [
      csvEscape(row.email || ""),
      csvEscape(row.emailStatus),
      csvEscape(row.whatsapp),
      csvEscape(row.whatsappStatus),
      csvEscape(row.source),
      csvEscape(row.createdAt.toISOString()),
    ].join(",")
  );
  return `\uFEFF${[header, ...lines].join("\n")}\n`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const rows = await prisma.arenaAlertSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      emailStatus: true,
      whatsapp: true,
      whatsappStatus: true,
      source: true,
      createdAt: true,
    },
  });

  return new NextResponse(alertsToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kishabuzz-arena-alertes.csv"',
    },
  });
}
