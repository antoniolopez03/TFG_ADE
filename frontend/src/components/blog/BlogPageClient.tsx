"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BlogArticleSummary, BlogCategory } from "@/lib/content/blog";

interface BlogPageClientProps {
  articles: BlogArticleSummary[];
  categories: BlogCategory[];
}

export function BlogPageClient({ articles, categories }: BlogPageClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const selectedCategory = categories.find((category) => category.id === activeCategory);
  const selectedCategoryLabel = selectedCategory?.id === "all" ? null : selectedCategory?.label ?? null;

  const filteredArticles = useMemo(() => {
    if (activeCategory === "all") {
      return articles;
    }

    return articles.filter((article) => article.category === selectedCategoryLabel);
  }, [activeCategory, articles, selectedCategoryLabel]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">
            Blog de Noticias / Recursos
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
            Recursos, Guias y Casos de Exito B2B.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-black/70 dark:text-white/70">
            Descubre como la inteligencia artificial y la automatizacion estan redefiniendo las ventas en el sector
            industrial espanol. Estrategias reales para directores comerciales.
          </p>
        </div>
      </section>

      <section className="border-y border-black/5 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6">
          {categories.map((category) => {
            const isActive = category.id === activeCategory;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors ${
                  isActive
                    ? "bg-leadby-500 text-white shadow-leadby-sm"
                    : "border border-leadby-500/30 text-leadby-600 hover:border-leadby-500/60 hover:bg-leadby-50 dark:text-leadby-200 dark:hover:bg-white/5"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <article
                key={article.slug}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-leadby-500/20 hover:shadow-md dark:border-white/10 dark:bg-white/5"
              >
                <div
                  className={`relative aspect-[16/9] overflow-hidden rounded-xl border border-leadby-500/20 bg-gradient-to-br ${article.gradient} dark:from-leadby-500/20 dark:via-leadby-400/10 dark:to-black/30`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,117,31,0.35),_transparent_60%)]" />
                  <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-leadby-600 backdrop-blur dark:bg-black/40 dark:text-leadby-200">
                    LeadBy Insight
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">
                  <span className="rounded-full bg-leadby-500/10 px-3 py-1 text-leadby-600 dark:text-leadby-200">
                    {article.category}
                  </span>
                  <time dateTime={article.dateTime}>{article.dateLabel}</time>
                  <span className="text-black/30 dark:text-white/30">.</span>
                  <span>{article.readingTime}</span>
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-snug md:text-xl">{article.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/70 dark:text-white/70">{article.excerpt}</p>

                <Link
                  href={`/blog/${article.slug}`}
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-leadby-600 transition-colors hover:text-leadby-500"
                >
                  Leer articulo
                  <span aria-hidden className="text-lg">
                    -&gt;
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-leadby-500/20 bg-leadby-400/10 px-8 py-12 text-center shadow-sm shadow-black/5 dark:bg-leadby-400/15">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              Quieres aplicar estas estrategias en tu empresa?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-black/70 dark:text-white/70">
              Agenda una demostracion y descubre como adaptar LeadBy a tu equipo comercial con un plan tecnico a
              medida.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-foreground shadow-leadby transition-colors hover:bg-leadby-600"
              >
                Agenda una demostracion
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
