import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getAllBlogSummaries,
  getBlogArticleBySlug,
  getRelatedBlogArticles,
} from "@/lib/content/blog";
import type { Metadata } from "next";

type Props = { params: { slug: string } };
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export async function generateStaticParams() {
  const articles = await getAllBlogSummaries();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getBlogArticleBySlug(params.slug);
  if (!article) return { title: "Artículo no encontrado" };

  const articleUrl = `/blog/${article.slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: articleUrl,
      images: [
        {
          url: "/images/og-cover.svg",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: ["/images/og-cover.svg"],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getBlogArticleBySlug(params.slug);
  if (!article) notFound();

  const relatedArticles = await getRelatedBlogArticles(article.category, article.slug, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.dateTime,
    dateModified: article.dateTime,
    articleSection: article.category,
    url: `${appUrl}/blog/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: "LeadBy",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back link */}
      <div className="mx-auto max-w-4xl px-6 pt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-leadby-500 transition-colors hover:text-leadby-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al blog
        </Link>
      </div>

      {/* Article header */}
      <header className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
          <span className="rounded-full bg-leadby-500/10 px-3 py-1 text-leadby-600 dark:text-leadby-200">
            {article.category}
          </span>
          <time dateTime={article.dateTime}>{article.dateLabel}</time>
          <span className="text-black/30 dark:text-white/30">·</span>
          <span>{article.readingTime}</span>
        </div>
        <h1 className="mt-6 text-balance text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-black/60 dark:text-white/60">{article.excerpt}</p>
      </header>

      {/* Hero gradient placeholder */}
      <div className="mx-auto max-w-4xl px-6">
        <div
          className={`relative aspect-[21/9] overflow-hidden rounded-2xl border border-leadby-500/20 bg-gradient-to-br ${article.gradient} dark:from-leadby-500/20 dark:via-leadby-400/10 dark:to-black/30`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,117,31,0.35),_transparent_60%)]" />
          <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-leadby-600 backdrop-blur dark:bg-black/40 dark:text-leadby-200">
            LeadBy Insight
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <article
          className="prose prose-neutral max-w-none leading-relaxed dark:prose-invert prose-headings:text-foreground prose-p:text-black/70 dark:prose-p:text-white/70 prose-a:text-leadby-500 dark:prose-a:text-leadby-400 prose-headings:font-semibold"
          dangerouslySetInnerHTML={{ __html: article.htmlBody }}
        />
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section className="border-t border-black/5 py-16 dark:border-white/10">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.26em] text-leadby-500">
              Artículos relacionados
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <article
                  key={related.slug}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-leadby-500/20 dark:border-white/10 dark:bg-white/5"
                >
                  <div
                    className={`relative aspect-[16/9] overflow-hidden rounded-xl border border-leadby-500/20 bg-gradient-to-br ${related.gradient} dark:from-leadby-500/20 dark:via-leadby-400/10 dark:to-black/30`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,117,31,0.35),_transparent_60%)]" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-leadby-600 backdrop-blur dark:bg-black/40 dark:text-leadby-200">
                      LeadBy Insight
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                    <span className="rounded-full bg-leadby-500/10 px-3 py-1 text-leadby-600 dark:text-leadby-200">
                      {related.category}
                    </span>
                    <time dateTime={related.dateTime}>{related.dateLabel}</time>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold leading-snug">{related.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/70 dark:text-white/70">
                    {related.excerpt}
                  </p>

                  <Link
                    href={`/blog/${related.slug}`}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-leadby-600 transition-colors hover:text-leadby-500"
                  >
                    Leer artículo
                    <span aria-hidden className="text-lg">
                      →
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-leadby-500/20 bg-leadby-400/10 px-8 py-12 text-center shadow-sm shadow-black/5 dark:bg-leadby-400/15">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              ¿Quieres aplicar estas estrategias en tu empresa?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
              Agenda una demostración y descubre cómo adaptar LeadBy a tu equipo comercial con un plan técnico a medida.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600"
              >
                Agenda una demostración
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
