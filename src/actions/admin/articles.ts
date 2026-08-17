"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePublic } from "@/lib/cache";
import {
  formDate,
  formOptionalId,
  formString,
  requireAdmin,
  type AdminActionState,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

const articleSchema = z.object({
  title: z.string().min(2, "Titre requis").max(220),
  slug: z.string().min(2).max(220).optional().or(z.literal("")),
  excerpt: z.string().max(2000).optional().default(""),
  content: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  contentType: z.enum(["ARTICLE", "CHRONIQUE", "ANALYSIS"]),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  publishedAt: z.date().nullable().optional(),
  scheduledAt: z.date().nullable().optional(),
  metaTitle: z.string().max(220).optional().default(""),
  metaDescription: z.string().max(500).optional().default(""),
  authorName: z.string().max(120).optional().default("KISHA BUZZ"),
  categoryId: z.string().nullable().optional(),
});

function parseArticle(formData: FormData) {
  return articleSchema.safeParse({
    title: formString(formData, "title"),
    slug: formString(formData, "slug"),
    excerpt: formString(formData, "excerpt"),
    content: formString(formData, "content"),
    coverImage: formString(formData, "coverImage"),
    contentType: formString(formData, "contentType") || "ARTICLE",
    status: formString(formData, "status") || "DRAFT",
    publishedAt: formDate(formData, "publishedAt"),
    scheduledAt: formDate(formData, "scheduledAt"),
    metaTitle: formString(formData, "metaTitle"),
    metaDescription: formString(formData, "metaDescription"),
    authorName: formString(formData, "authorName") || "KISHA BUZZ",
    categoryId: formOptionalId(formData, "categoryId"),
  });
}

async function uniqueArticleSlug(base: string, excludeId?: string) {
  let slug = createSlug(base);
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
  const slug = await uniqueArticleSlug(data.slug || data.title, id || undefined);
  const publishedAt =
    data.status === "PUBLISHED"
      ? data.publishedAt || new Date()
      : data.publishedAt;

  const payload = {
    title: data.title,
    slug,
    excerpt: data.excerpt || "",
    content: data.content || "",
    coverImage: data.coverImage || "",
    contentType: data.contentType,
    status: data.status,
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

  revalidatePath("/admin/articles");
  revalidatePath("/chroniques");
  revalidatePath("/publications");
  revalidatePublic();
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
  revalidatePublic();
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
  revalidatePublic();
}
