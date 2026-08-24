import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  __kishaBuzzPrisma?: PrismaClient;
};

function withConnectionParams(url: string) {
  if (!url) return url;
  const extra: string[] = [];
  if (!url.includes("connect_timeout=")) extra.push("connect_timeout=15");
  if (!url.includes("pool_timeout=")) extra.push("pool_timeout=30");
  if (url.includes("pooled.") && !url.includes("pgbouncer=")) extra.push("pgbouncer=true");
  if (!extra.length) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${extra.join("&")}`;
}

function getClient() {
  if (globalForPrisma.__kishaBuzzPrisma) return globalForPrisma.__kishaBuzzPrisma;
  const url = withConnectionParams(process.env.DATABASE_URL || "");
  const adapter = new PrismaPg({ connectionString: url });
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    adapter,
  });
  globalForPrisma.__kishaBuzzPrisma = client;
  return client;
}

export const prisma = getClient();
