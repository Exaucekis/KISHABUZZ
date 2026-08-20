import "dotenv/config";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { isImageSrc } from "../src/lib/media";

const prisma = new PrismaClient();

async function httpStatus(url: string) {
  const response = await fetch(url, { method: "GET", redirect: "follow", cache: "no-store" });
  return response.status;
}

async function pageHasImage(pageUrl: string, imageUrl: string) {
  const response = await fetch(pageUrl, { cache: "no-store" });
  const html = await response.text();
  return {
    status: response.status,
    hasUrl: html.includes(imageUrl),
    hasFallbackKb: />KB</.test(html) && !html.includes("<img"),
  };
}

async function main() {
  const files = await prisma.libraryFile.findMany({
    where: { kind: "IMAGE" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  assert.ok(files.length > 0, "Aucun fichier image en bibliothèque");

  const publicFiles = files.filter((file) => file.url.includes("public.blob.vercel-storage.com"));
  assert.ok(publicFiles.length > 0, "Aucun blob public en bibliothèque");

  const first = publicFiles[0];
  assert.equal(isImageSrc(first.url), true);

  const blobStatus = await httpStatus(first.url);
  assert.equal(blobStatus, 200, `Blob inaccessible (${blobStatus}) : ${first.url}`);

  const pitch = await prisma.event.findUnique({ where: { slug: "pitch-party" } });
  assert.ok(pitch, "Événement pitch-party introuvable");

  await prisma.event.update({
    where: { id: pitch.id },
    data: { poster: first.url },
  });

  const saved = await prisma.event.findUnique({
    where: { slug: "pitch-party" },
    select: { poster: true },
  });
  assert.equal(saved?.poster, first.url);

  const page = await pageHasImage("https://www.kisha-buzz.com/evenements/pitch-party", first.url);
  assert.equal(page.status, 200, "La fiche publique Pitch party ne répond pas");
  assert.equal(page.hasUrl, true, "La fiche publique n’inclut pas encore l’URL de l’affiche");

  console.log("media attach tests: ok");
  console.log("poster:", first.url);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
