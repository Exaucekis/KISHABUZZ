"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { applyPublicWrites } from "@/lib/cache";
import {
  formDate,
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { normalizeCoverFocus } from "@/lib/cover-focus";
import { createSlug } from "@/lib/utils";

const articleSchema = z.object({
  title: z.string().min(2, "Titre requis").max(220),
  slug: z.string().min(2).max(220).optional().or(z.literal("")),
  excerpt: z.string().max(2000).optional().default(""),
  content: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  coverAlt: z.string().max(300).optional().default(""),
  coverFocus: z.string().max(24).optional().default("50% 50%"),
  contentType: z.enum(["ARTICLE", "CHRONIQUE", "ANALYSIS"]),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  publishedAt: z.date().nullable().optional(),
  scheduledAt: z.date().nullable().optional(),
  metaTitle: z.string().max(220).optional().default(""),
  metaDescription: z.string().max(500).optional().default(""),
  authorName: z.string().max(120).optional().default("KISHA BUZZ"),
  categoryId: z.string().nullable().optional(),
  tags: z.string().optional().default(""),
});

function parseTags(raw: string) {
  const seen = new Set<string>();
  const tags: { name: string; slug: string }[] = [];
  for (const part of raw.split(/[,;]/)) {
    const name = part.trim();
    if (!name) continue;
    const slug = createSlug(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    tags.push({ name, slug });
  }
  return tags;
}

async function syncArticleTags(articleId: string, raw: string) {
  const tags = parseTags(raw);
  await prisma.articleTag.deleteMany({ where: { articleId } });
  if (!tags.length) return;

  for (const tag of tags) {
    const record = await prisma.tag.upsert({
      where: { slug: tag.slug },
      create: { name: tag.name, slug: tag.slug },
      update: { name: tag.name },
    });
    await prisma.articleTag.create({
      data: { articleId, tagId: record.id },
    });
  }
}

function parseArticle(formData: FormData) {
  return articleSchema.safeParse({
    title: formString(formData, "title"),
    slug: formString(formData, "slug"),
    excerpt: formString(formData, "excerpt"),
    content: formString(formData, "content"),
    coverImage: formString(formData, "coverImage"),
    coverAlt: formString(formData, "coverAlt"),
    coverFocus: formString(formData, "coverFocus"),
    contentType: formString(formData, "contentType") || "ARTICLE",
    status: formString(formData, "status") || "DRAFT",
    publishedAt: formDate(formData, "publishedAt"),
    scheduledAt: formDate(formData, "scheduledAt"),
    metaTitle: formString(formData, "metaTitle"),
    metaDescription: formString(formData, "metaDescription"),
    authorName: formString(formData, "authorName") || "KISHA BUZZ",
    categoryId: formOptionalId(formData, "categoryId"),
    tags: formString(formData, "tags"),
  });
}

async function uniqueArticleSlug(base: string, excludeId?: string) {
  const slug = createSlug(base);
  let i = 0;
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await prisma.article.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
  }
}

export async function saveArticle(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await requireAdmin();
  const id = formOptionalId(formData, "id");
  const parsed = parseArticle(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger le formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  if (data.status === "SCHEDULED" && !data.scheduledAt) {
    return { ok: false, message: "Indiquez une date de programmation." };
  }

  const status =
    data.status === "SCHEDULED" && data.scheduledAt && data.scheduledAt <= new Date()
      ? "PUBLISHED"
      : data.status;

  const slug = await uniqueArticleSlug(data.slug || data.title, id || undefined);
  const publishedAt =
    status === "PUBLISHED"
      ? data.publishedAt || data.scheduledAt || new Date()
      : data.publishedAt;

  const payload = {
    title: data.title,
    slug,
    excerpt: data.excerpt || "",
    content: data.content || "",
    coverImage: data.coverImage || "",
    coverAlt: data.coverAlt || "",
    coverFocus: normalizeCoverFocus(data.coverFocus),
    contentType: data.contentType,
    status,
    publishedAt,
    scheduledAt: data.scheduledAt,
    metaTitle: data.metaTitle || "",
    metaDescription: data.metaDescription || "",
    authorName: data.authorName || "KISHA BUZZ",
    categoryId: data.categoryId,
    authorId: session.user.id,
  };

  const article = id
    ? await prisma.article.update({ where: { id }, data: payload })
    : await prisma.article.create({ data: payload });

  await syncArticleTags(article.id, data.tags || "");

  revalidatePath("/admin/articles");
  revalidatePath("/chroniques");
  revalidatePath("/publications");
  applyPublicWrites();
  redirect(`/admin/articles/${article.id}`);
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return;
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
  revalidatePath("/chroniques");
  revalidatePath("/publications");
  applyPublicWrites();
  redirect("/admin/articles");
}

export async function setArticleStatus(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const status = formString(formData, "status");
  if (!id || !status) return;
  await prisma.article.update({
    where: { id },
    data: {
      status,
      ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
    },
  });
  revalidatePath("/admin/articles");
  revalidatePath("/chroniques");
  revalidatePath("/publications");
  applyPublicWrites();
}
