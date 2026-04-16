import "server-only";

import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { z } from "zod";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const DEFAULT_GRADIENT = "from-leadby-500/15 via-rose-400/10 to-leadby-100/20";
const DEFAULT_AUTHOR = "Equipo LeadBy";

const frontmatterSchema = z.object({
  slug: z.string().trim().min(1),
  category: z.string().trim().min(1),
  dateTime: z.string().trim().min(1),
  title: z.string().trim().min(1),
  excerpt: z.string().trim().min(1),
  readingTime: z.string().trim().min(1),
  dateLabel: z.string().trim().min(1).optional(),
  gradient: z.string().trim().min(1).optional(),
  coverImage: z.string().trim().min(1).optional(),
  coverImageAlt: z.string().trim().min(1).optional(),
  author: z.string().trim().min(1).optional(),
});

const categoryIdMap: Record<string, string> = {
  "Casos de Éxito": "cases",
  "Guías de Ventas B2B": "guides",
  "Inteligencia Artificial": "ai",
};

export interface BlogCategory {
  id: string;
  label: string;
}

export interface BlogArticleSummary {
  slug: string;
  category: string;
  dateLabel: string;
  dateTime: string;
  title: string;
  excerpt: string;
  readingTime: string;
  gradient: string;
  coverImage: string;
  coverImageAlt: string;
  author: string;
}

export interface BlogArticle extends BlogArticleSummary {
  markdownBody: string;
  htmlBody: string;
}

function getCategoryId(label: string): string {
  if (categoryIdMap[label]) {
    return categoryIdMap[label];
  }

  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function estimateReadingTime(markdownBody: string): string {
  const words = markdownBody.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min lectura`;
}

function normalizeFrontmatterInput(
  input: unknown,
  fallback: { slug?: string; readingTime?: string } = {}
): Record<string, unknown> {
  if (!input || typeof input !== "object") {
    return {
      slug: fallback.slug,
      readingTime: fallback.readingTime,
    };
  }

  const data = input as Record<string, unknown>;

  return {
    slug: data.slug ?? fallback.slug,
    category: data.category,
    dateTime: data.dateTime ?? data.date,
    dateLabel: data.dateLabel,
    title: data.title,
    excerpt: data.excerpt ?? data.description,
    readingTime: data.readingTime ?? fallback.readingTime,
    gradient: data.gradient,
    coverImage: data.coverImage ?? data.image,
    coverImageAlt: data.coverImageAlt ?? data.imageAlt,
    author: data.author,
  };
}

function formatDateLabel(dateTime: string): string {
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return dateTime;
  }

  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function resolveCoverImagePath(coverImage: string | undefined, slug: string): string {
  if (!coverImage) {
    return `/images/blog/${slug}.jpg`;
  }

  if (/^https?:\/\//i.test(coverImage) || coverImage.startsWith("/")) {
    return coverImage;
  }

  return `/images/blog/${coverImage.replace(/^\/+/, "")}`;
}

function toSummary(data: z.infer<typeof frontmatterSchema>): BlogArticleSummary {
  return {
    slug: data.slug,
    category: data.category,
    dateLabel: formatDateLabel(data.dateTime),
    dateTime: data.dateTime,
    title: data.title,
    excerpt: data.excerpt,
    readingTime: data.readingTime,
    gradient: data.gradient ?? DEFAULT_GRADIENT,
    coverImage: resolveCoverImagePath(data.coverImage, data.slug),
    coverImageAlt: data.coverImageAlt ?? `Imagen destacada del artículo ${data.title}`,
    author: data.author ?? DEFAULT_AUTHOR,
  };
}

const renderMarkdownToHtml = cache(async (markdownBody: string): Promise<string> => {
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(markdownBody);
  return processed.toString();
});

export const getAllBlogSummaries = cache(async (): Promise<BlogArticleSummary[]> => {
  const files = await fs.readdir(BLOG_DIR);

  const markdownFiles = files.filter((fileName) => fileName.endsWith(".md"));

  const summaries = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const filePath = path.join(BLOG_DIR, fileName);
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);
      const slugFromFileName = fileName.replace(/\.md$/i, "");
      const parsed = frontmatterSchema.parse(
        normalizeFrontmatterInput(data, {
          slug: slugFromFileName,
          readingTime: estimateReadingTime(content),
        })
      );
      return toSummary(parsed);
    })
  );

  return summaries.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
});

export const getBlogArticleBySlug = cache(async (slug: string): Promise<BlogArticle | null> => {
  const safeSlug = slug.trim();
  if (!safeSlug) {
    return null;
  }

  const filePath = path.join(BLOG_DIR, `${safeSlug}.md`);

  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  const parsed = frontmatterSchema.safeParse(
    normalizeFrontmatterInput(data, {
      slug: safeSlug,
      readingTime: estimateReadingTime(content),
    })
  );

  if (!parsed.success) {
    return null;
  }

  const summary = toSummary(parsed.data);
  const markdownBody = content.trim();
  const htmlBody = await renderMarkdownToHtml(markdownBody);

  return {
    ...summary,
    markdownBody,
    htmlBody,
  };
});

export async function getRelatedBlogArticles(
  category: string,
  excludedSlug: string,
  limit = 3
): Promise<BlogArticleSummary[]> {
  const summaries = await getAllBlogSummaries();
  return summaries
    .filter((article) => article.category === category && article.slug !== excludedSlug)
    .slice(0, limit);
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const summaries = await getAllBlogSummaries();
  const labels = Array.from(new Set(summaries.map((item) => item.category)));

  const categories = labels.map((label) => ({
    id: getCategoryId(label),
    label,
  }));

  const ordered = ["cases", "guides", "ai"];

  categories.sort((a, b) => {
    const aIndex = ordered.indexOf(a.id);
    const bIndex = ordered.indexOf(b.id);

    if (aIndex === -1 && bIndex === -1) {
      return a.label.localeCompare(b.label, "es");
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });

  return [{ id: "all", label: "Todos" }, ...categories];
}
