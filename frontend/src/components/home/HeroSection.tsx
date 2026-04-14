"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Link from "next/link";

const METRICS = [
  { display: "−80%", to: 80, prefix: "−", suffix: "%", label: "Tiempo en prospección" },
  { display: "+35%", to: 35, prefix: "+", suffix: "%", label: "Oportunidades cualificadas" },
  { display: "×10", to: 10, prefix: "×", suffix: "", label: "Tasa de respuesta vs. correo masivo" },
];

const TRUST_LOGOS = ["HubSpot", "Google Gemini", "Next.js API", "Supabase", "Resend"];

const MOCK_LEADS = [
  { company: "Técnicas del Henares S.L.", contact: "J. Ramírez", role: "Dir. Compras" },
  { company: "Mecanizados Levante", contact: "M. Pérez", role: "Gerente" },
  { company: "Distribuidora Ibérica CNC", contact: "A. García", role: "Resp. Técnico" },
  { company: "Industrias Castilla Norte", contact: "P. Llorente", role: "CEO" },
];

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          noMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean; noMotion: boolean };

          if (!motion) {
            gsap.set(
              [
                ".h-badge",
                ".h-headline",
                ".h-subtitle",
                ".h-metric",
                ".h-cta",
                ".h-trust",
                ".h-mockup",
              ],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          // ── Entry timeline ─────────────────────────────────────────────────
          const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 0.65 },
          });

          tl.from(".h-badge", { y: -20, autoAlpha: 0 })
            .from(".h-headline", { y: 40, autoAlpha: 0 }, "-=0.3")
            .from(".h-subtitle", { y: 30, autoAlpha: 0 }, "-=0.4")
            .from(".h-metric", { y: 20, autoAlpha: 0, stagger: 0.1 }, "-=0.3")
            .from(".h-cta", { y: 20, autoAlpha: 0, stagger: 0.08 }, "-=0.3")
            .from(".h-trust", { autoAlpha: 0, duration: 0.4 }, "-=0.2");

          // Mockup enters independently with slight delay
          gsap.from(".h-mockup", {
            y: 60,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: 0.5,
          });

          // ── CountUp animations (run after entry, scroll-triggered) ─────────
          const metricEls =
            containerRef.current?.querySelectorAll<HTMLElement>("[data-countup]") ?? [];

          metricEls.forEach((el) => {
            const to = Number(el.getAttribute("data-to"));
            const prefix = el.getAttribute("data-prefix") ?? "";
            const suffix = el.getAttribute("data-suffix") ?? "";
            const obj = { val: 0 };

            gsap.to(obj, {
              val: to,
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 95%",
                once: true,
              },
              onUpdate() {
                el.textContent = prefix + Math.round(obj.val) + suffix;
              },
            });
          });

          // ── Continuous gentle float on mockup ─────────────────────────────
          gsap.to(".h-mockup", {
            y: -8,
            duration: 3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.4,
          });

          // ── Mouse parallax on mockup ───────────────────────────────────────
          if (contextSafe) {
            const onMouseMove = contextSafe((e: Event) => {
              const me = e as MouseEvent;
              const el = containerRef.current;
              if (!el) return;
              const rect = el.getBoundingClientRect();
              const nx = (me.clientX - rect.left - rect.width / 2) / (rect.width / 2);
              const ny = (me.clientY - rect.top - rect.height / 2) / (rect.height / 2);
              gsap.to(".h-mockup", {
                rotationY: nx * 8,
                rotationX: -ny * 4,
                transformPerspective: 900,
                duration: 0.8,
                ease: "power2.out",
                overwrite: "auto",
              });
            });

            const onMouseLeave = contextSafe(() => {
              gsap.to(".h-mockup", {
                rotationY: 0,
                rotationX: 0,
                duration: 0.8,
                ease: "power2.out",
                overwrite: "auto",
              });
            });

            const el = containerRef.current;
            el?.addEventListener("mousemove", onMouseMove);
            el?.addEventListener("mouseleave", onMouseLeave);

            return () => {
              el?.removeEventListener("mousemove", onMouseMove);
              el?.removeEventListener("mouseleave", onMouseLeave);
            };
          }
        }
      );

      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90dvh] overflow-hidden flex items-center"
    >
      {/* Ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-leadby-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-leadby-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-20 grid items-center gap-12 md:grid-cols-[1.2fr_0.8fr] md:py-28">

        {/* ── Left: copy ───────────────────────────────────────────────────── */}
        <div>
          {/* Badge */}
          <div
            className="h-badge mb-6 inline-flex items-center gap-2 rounded-full border border-leadby-500/40 bg-leadby-500/8 px-3 py-1 text-xs font-medium text-leadby-500"
            style={{ visibility: "hidden" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-leadby-500 animate-pulse" />
            Prospección B2B · Sector Industrial
          </div>

          {/* H1 */}
          <h1
            className="h-headline text-balance text-5xl font-semibold leading-[1.08] md:text-7xl"
            style={{ visibility: "hidden" }}
          >
            Multiplica las ventas B2B{" "}
            <span className="text-leadby-gradient">sin aumentar</span> tu equipo comercial.
          </h1>

          {/* Subtitle */}
          <p
            className="h-subtitle mt-6 text-lg leading-relaxed text-black/65 dark:text-white/65 max-w-lg"
            style={{ visibility: "hidden" }}
          >
            LeadBy automatiza la búsqueda de clientes, redacta los correos con IA y los
            sincroniza con tu CRM. Tus comerciales solo cierran contratos.
          </p>

          {/* Metrics row */}
          <div className="mt-10 flex flex-wrap items-start gap-x-8 gap-y-4">
            {METRICS.map((m, i) => (
              <div
                key={i}
                className="h-metric flex flex-col"
                style={{ visibility: "hidden" }}
              >
                <span
                  className="text-3xl font-bold text-leadby-500 tabular-nums"
                  data-countup
                  data-to={m.to}
                  data-prefix={m.prefix}
                  data-suffix={m.suffix}
                >
                  {m.display}
                </span>
                <span className="mt-0.5 text-xs text-black/55 dark:text-white/55 max-w-[110px] leading-tight">
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="h-cta inline-flex items-center gap-2 rounded-full bg-leadby-500 px-6 py-3 text-sm font-semibold text-white shadow-leadby transition-all hover:bg-leadby-600 hover:shadow-leadby"
              style={{ visibility: "hidden" }}
            >
              Solicitar demo
            </Link>
            <button
              onClick={() =>
                document
                  .getElementById("demo-video")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="h-cta inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/15 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-leadby-500/50 hover:text-leadby-500"
              style={{ visibility: "hidden" }}
            >
              Ver cómo funciona ↓
            </button>
          </div>

          {/* Trust bar */}
          <div
            className="h-trust mt-8 flex flex-wrap items-center gap-3"
            style={{ visibility: "hidden" }}
          >
            <span className="text-xs text-black/40 dark:text-white/40">Integrado con:</span>
            {TRUST_LOGOS.map((name) => (
              <span
                key={name}
                className="font-mono text-xs bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 px-2.5 py-1 rounded-full text-black/50 dark:text-white/50"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right: dashboard mockup ───────────────────────────────────────── */}
        <div
          className="h-mockup relative rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-leadby-500/20 shadow-[0_0_60px_rgba(255,117,31,0.12)] p-1"
          style={{ visibility: "hidden" }}
        >
          {/* Window bar */}
          <div className="flex items-center gap-1.5 rounded-t-xl border border-black/5 dark:border-white/8 bg-white/90 dark:bg-gray-900/90 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 flex-1 text-center text-[11px] text-black/40 dark:text-white/40 font-mono">
              LeadBy Dashboard
            </span>
          </div>

          <div className="rounded-b-xl border border-t-0 border-black/5 dark:border-white/8 bg-white/70 dark:bg-gray-950/80 p-3 space-y-3">
            {/* KPI chips */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "47", label: "leads descubiertos", accent: true },
                { value: "12", label: "correos enviados", accent: false },
                { value: "3", label: "respuestas", accent: true },
              ].map((kpi, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-2.5 ${
                    kpi.accent
                      ? "border-leadby-500/20 bg-leadby-500/5"
                      : "border-black/5 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03]"
                  }`}
                >
                  <div className="text-lg font-bold text-foreground tabular-nums">
                    {kpi.value}
                  </div>
                  <div className="text-[10px] text-black/50 dark:text-white/50 leading-tight mt-0.5">
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Leads mini-table */}
            <div className="rounded-lg border border-black/5 dark:border-white/8 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/5 dark:border-white/8">
                <span className="text-[10px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wide">Empresa</span>
                <span className="text-[10px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wide">Contacto</span>
                <span className="text-[10px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wide hidden sm:block">Cargo</span>
                <span className="text-[10px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wide">Acción</span>
              </div>

              {MOCK_LEADS.map((lead, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-center px-3 py-2 border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-leadby-500/[0.03] transition-colors"
                >
                  <span className="text-[11px] font-medium text-foreground truncate">
                    {lead.company}
                  </span>
                  <span className="text-[10px] text-black/60 dark:text-white/60 whitespace-nowrap">
                    {lead.contact}
                  </span>
                  <span className="text-[10px] text-black/45 dark:text-white/45 whitespace-nowrap hidden sm:block">
                    {lead.role}
                  </span>
                  <div className="flex gap-1">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-medium px-1.5 py-0.5 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                      ✓
                    </span>
                    <span className="rounded-full bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-white/40 text-[9px] font-medium px-1.5 py-0.5 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/12 transition-colors">
                      ✕
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI badge */}
            <div className="flex items-center gap-2 rounded-lg border border-leadby-500/20 bg-leadby-500/5 px-3 py-2">
              <span className="animate-pulse text-leadby-500 text-sm">✦</span>
              <span className="text-[11px] text-leadby-500 font-medium">
                IA generando borrador...
              </span>
              <div className="ml-auto flex gap-0.5">
                <span className="h-1 w-1 rounded-full bg-leadby-500/60 animate-bounce [animation-delay:0ms]" />
                <span className="h-1 w-1 rounded-full bg-leadby-500/60 animate-bounce [animation-delay:150ms]" />
                <span className="h-1 w-1 rounded-full bg-leadby-500/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
