import { PrismaClient } from "@prisma/client";
import { articlePreviewPath, articlePublicPath } from "../src/lib/article-paths";

const p = new PrismaClient();

async function main() {
  const pub = await p.article.findFirst({
    where: { status: "PUBLISHED" },
    select: { slug: true, contentType: true, title: true },
  });
  const draft = await p.article.findFirst({
    where: { status: { not: "PUBLISHED" } },
    select: { slug: true, contentType: true },
  });

  if (pub) {
    const res = await fetch(`http://localhost:3000${articlePublicPath(pub.contentType, pub.slug)}`);
    const html = await res.text();
    console.log("published", res.status, html.includes(pub.title), !html.includes("Invisible du public"));
  } else {
    console.log("published none");
  }

  if (draft) {
    const res = await fetch(`http://localhost:3000${articlePreviewPath(draft.contentType, draft.slug)}`);
    console.log("draft-preview-anon", res.status);
  } else {
    console.log("draft none");
  }
}

main().finally(() => p.$disconnect());
