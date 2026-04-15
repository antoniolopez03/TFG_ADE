"use client";

import { Reveal } from "@/lib/animations/reveal";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STACK = [
  {
    name: "Next.js 14",
    role: "Framework React full-stack con App Router, RSC y edge rendering.",
    icon: NextjsIcon,
    color: "from-black/10 to-black/5 dark:from-white/10 dark:to-white/5",
    border: "hover:border-black/40 dark:hover:border-white/40",
  },
  {
    name: "Supabase",
    role: "PostgreSQL multitenant + Auth + Vault para aislamiento criptográfico.",
    icon: SupabaseIcon,
    color: "from-emerald-500/10 to-emerald-500/5",
    border: "hover:border-emerald-500/50",
  },
  {
    name: "Google Gemini",
    role: "Generación de cold emails hiperpersonalizados con contexto real.",
    icon: GeminiIcon,
    color: "from-blue-500/10 to-blue-500/5",
    border: "hover:border-blue-500/40",
  },
  {
    name: "Apollo.io",
    role: "Base de datos B2B con 275 M+ contactos verificados y datos de empresa.",
    icon: ApolloIcon,
    color: "from-violet-500/10 to-violet-500/5",
    border: "hover:border-violet-500/40",
  },
  {
    name: "Resend",
    role: "Envío transaccional DKIM/SPF para máxima entregabilidad.",
    icon: ResendIcon,
    color: "from-zinc-500/10 to-zinc-500/5",
    border: "hover:border-zinc-400/50 dark:hover:border-zinc-300/30",
  },
  {
    name: "Vercel",
    role: "Infraestructura serverless global con previews automáticas por rama.",
    icon: VercelIcon,
    color: "from-black/10 to-black/5 dark:from-white/10 dark:to-white/5",
    border: "hover:border-black/40 dark:hover:border-white/40",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TechStackSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <Reveal direction="up" threshold={0.1}>
          <div className="mb-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-leadby-500">
              Tecnología
            </p>
            <h2 className="text-3xl font-semibold text-balance md:text-4xl">
              Stack diseñado para escalar sin fricción
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/60 dark:text-white/60">
              Cada capa fue elegida por rendimiento, coste y velocidad de integración.
              Sin vendor lock-in, sin dependencias propietarias innecesarias.
            </p>
          </div>
        </Reveal>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.name} direction="up" delay={i * 0.08} threshold={0.05}>
                <article className={[
                  "group relative overflow-hidden rounded-2xl border border-black/8 dark:border-white/8",
                  "bg-gradient-to-br p-6",
                  "transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]",
                  "hover:shadow-[0_12px_40px_rgba(255,117,31,0.08)]",
                  item.color,
                  item.border,
                ].join(" ")}>
                  {/* Glow on hover */}
                  <div
                    aria-hidden
                    className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-leadby-500/0 blur-2xl transition-all duration-500 group-hover:bg-leadby-500/10"
                  />

                  <div className="relative">
                    {/* Icon */}
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-black/8 dark:border-white/8 bg-white/60 dark:bg-white/5">
                      <Icon />
                    </div>

                    {/* Name */}
                    <h3 className="mb-2 text-base font-semibold">{item.name}</h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-black/60 dark:text-white/60">
                      {item.role}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── SVG icons (inline, no external deps) ────────────────────────────────────

function NextjsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.2 14.4V8.8l7.2 9.6H16L8 8.8v7.6H6.8V7.6H8l8 10.4h-1.2L8.8 8.8v7.6H10.8z" />
    </svg>
  );
}

function SupabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-500" fill="currentColor">
      <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.101 12.888.695 14.076 1.76 14.076H12.3l.1 8.888c.015.987 1.26 1.41 1.876.637l9.261-11.65c.663-.838.069-2.026-.996-2.026H12.0l-.1-8.889z" />
    </svg>
  );
}

function GeminiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" fill="currentColor">
      <path d="M12 2L15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ApolloIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-violet-500" fill="currentColor">
      <circle cx="12" cy="12" r="9" opacity="0.2" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ResendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function VercelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  );
}
