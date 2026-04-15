"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Send,
  TrendingUp,
  Building2,
  Zap,
  Clock,
  CheckCircle2,
  Mail,
  BarChart3,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardClientProps {
  orgName: string | null;
  plan: string;
  totalLeads: number;
  leadsEnviados: number;
  leadsPendientes: number;
  hubspotDealsWon: number;
  hubspotRevenueWon: number;
  hubspotMetricsSource: "hubspot" | "sin_token" | "error";
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

/**
 * Renders a minimal 7-point trend line inside a metric card.
 * Pure SVG — no JS animation needed (the card itself animates in via GSAP).
 */
function Sparkline({
  points,
  color,
}: {
  points: number[];
  color: string;
}) {
  const W = 64;
  const H = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      className="dash-sparkline opacity-0"
    >
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
    </svg>
  );
}

/** Generates plausible 7-day sparkline data relative to a current value. */
function makeSparkData(
  current: number,
  trend: "up" | "down" | "flat"
): number[] {
  const base = Math.max(current, 3);
  if (trend === "up") {
    return [
      base * 0.42, base * 0.55, base * 0.6, base * 0.72,
      base * 0.8, base * 0.91, base,
    ];
  }
  if (trend === "down") {
    return [
      base, base * 0.9, base * 0.75, base * 0.65,
      base * 0.55, base * 0.48, base * 0.4,
    ];
  }
  // flat with noise
  return Array.from({ length: 7 }, (_, i) =>
    base * (0.78 + Math.sin(i * 1.8) * 0.14)
  );
}

// ─── Activity timeline data ───────────────────────────────────────────────────

const ACTIVITY_ITEMS = [
  {
    icon: Zap,
    color: "text-leadby-500",
    bg:    "bg-leadby-500/10",
    text:  "3 nuevos leads descubiertos",
    sub:   "Maquinaria Industrial · España",
    time:  "Hace 5 min",
  },
  {
    icon: Mail,
    color: "text-blue-500",
    bg:    "bg-blue-500/10",
    text:  "Email aprobado y enviado",
    sub:   "Técnicas del Henares S.L.",
    time:  "Hace 23 min",
  },
  {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg:    "bg-emerald-500/10",
    text:  "Lead calificado manualmente",
    sub:   "Mecanizados Levante · Dir. Compras",
    time:  "Hace 1 h",
  },
  {
    icon: Search,
    color: "text-violet-500",
    bg:    "bg-violet-500/10",
    text:  "Búsqueda completada",
    sub:   "12 leads · Sector CNC",
    time:  "Hace 3 h",
  },
  {
    icon: Building2,
    color: "text-amber-500",
    bg:    "bg-amber-500/10",
    text:  "Sincronización HubSpot",
    sub:   "4 deals actualizados",
    time:  "Ayer",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardClient({
  orgName,
  plan,
  totalLeads,
  leadsEnviados,
  leadsPendientes,
  hubspotDealsWon,
  hubspotRevenueWon,
  hubspotMetricsSource,
}: DashboardClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const revenueFormatted = hubspotRevenueWon.toLocaleString("es-ES", {
    maximumFractionDigits: 0,
  });

  // Metric cards data
  const METRICS = [
    {
      label:   "Total leads",
      valor:   totalLeads,
      icon:    Users,
      stroke:  "#3b82f6",
      from:    "from-blue-500/15",
      to:      "to-blue-500/5",
      iconCls: "text-blue-600 dark:text-blue-400",
      spark:   makeSparkData(totalLeads, "up"),
      trend:   "up" as const,
    },
    {
      label:   "Correos enviados",
      valor:   leadsEnviados,
      icon:    Send,
      stroke:  "#22c55e",
      from:    "from-green-500/15",
      to:      "to-green-500/5",
      iconCls: "text-green-600 dark:text-green-400",
      spark:   makeSparkData(leadsEnviados, "up"),
      trend:   "up" as const,
    },
    {
      label:   "Pendientes aprobación",
      valor:   leadsPendientes,
      icon:    TrendingUp,
      stroke:  "#f59e0b",
      from:    "from-amber-500/15",
      to:      "to-amber-500/5",
      iconCls: "text-amber-600 dark:text-amber-400",
      spark:   makeSparkData(leadsPendientes, "flat"),
      trend:   "flat" as const,
    },
    {
      label:   "Deals ganados (HubSpot)",
      valor:   hubspotDealsWon,
      icon:    Building2,
      stroke:  "#8b5cf6",
      from:    "from-violet-500/15",
      to:      "to-violet-500/5",
      iconCls: "text-violet-600 dark:text-violet-400",
      spark:   makeSparkData(hubspotDealsWon, "up"),
      trend:   "up" as const,
    },
  ];

  // ── GSAP animation ─────────────────────────────────────────────────────────
  useGSAP(
    () => {
      /*
       * gsap.utils.selector(containerRef) — all selectors are scoped to this
       * component's DOM subtree, never matching elements outside.
       * gsap-react best practice: always scope selectors.
       */
      const q = gsap.utils.selector(containerRef);

      const mm = gsap.matchMedia();

      /*
       * Use the conditions object form of matchMedia so we can branch on
       * both motion preference and breakpoint in a single callback.
       * gsap-core best practice: use matchMedia for prefers-reduced-motion.
       */
      mm.add(
        {
          motion:  "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { motion: hasMotion } = ctx.conditions as {
            motion: boolean;
            reduced: boolean;
          };

          if (!hasMotion) {
            gsap.set(
              [
                q(".dash-header"),
                q(".dash-metric-card"),
                q(".dash-actions"),
                q(".dash-activity"),
                q(".dash-sparkline"),
              ],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          /*
           * Set initial states synchronously (useGSAP uses useLayoutEffect)
           * so nothing is visible before the first paint.
           * gsap-performance: only transform + autoAlpha — compositor-only.
           */
          gsap.set(q(".dash-header"),       { autoAlpha: 0, y: 12 });
          gsap.set(q(".dash-metric-card"),  { autoAlpha: 0, y: 20, willChange: "transform" });
          gsap.set(q(".dash-sparkline"),    { autoAlpha: 0 });
          gsap.set(q(".dash-actions"),      { autoAlpha: 0, y: 14 });
          gsap.set(q(".dash-action-item"),  { autoAlpha: 0, x: -10 });
          gsap.set(q(".dash-activity"),     { autoAlpha: 0, y: 14 });
          gsap.set(q(".dash-activity-item"),{ autoAlpha: 0, y: 8 });

          /*
           * gsap-timeline best practices:
           * — Pass defaults into the constructor (shared ease + duration).
           * — Use addLabel for readable sequencing.
           * — Use position parameter ("-=X", "<", "label+=0.2") to overlap.
           * — Do NOT nest ScrollTriggers inside the timeline children.
           */
          const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 0.48 },
          });

          tl
            .addLabel("header", 0)
            .to(q(".dash-header"), { autoAlpha: 1, y: 0 }, "header")

            .addLabel("cards", "header+=0.18")
            /*
             * gsap.utils.distribute — curves the stagger delay across an
             * ease, giving a more organic rhythm than a flat interval.
             * gsap-utils best practice: use distribute for list animations.
             */
            .to(
              q(".dash-metric-card"),
              {
                autoAlpha: 1,
                y: 0,
                stagger: gsap.utils.distribute({
                  from: "start",
                  each: 0.09,
                  ease: "power1.out",
                }),
                // clearProps removes will-change after animation completes
                // gsap-performance: release GPU layer when done
                clearProps: "willChange",
              },
              "cards"
            )

            // Sparklines fade in after cards are visible
            .to(q(".dash-sparkline"), {
              autoAlpha: 1,
              duration: 0.4,
              stagger: 0.08,
            }, "cards+=0.4")

            .addLabel("actions", "cards+=0.35")
            .to(q(".dash-actions"),     { autoAlpha: 1, y: 0, duration: 0.4 },                         "actions")
            .to(q(".dash-action-item"), { autoAlpha: 1, x: 0, stagger: 0.09, duration: 0.35 },         "actions+=0.1")

            .addLabel("activity", "actions+=0.25")
            .to(q(".dash-activity"),      { autoAlpha: 1, y: 0, duration: 0.4 },                       "activity")
            .to(q(".dash-activity-item"), { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.32 },       "activity+=0.1");

          /*
           * CountUp for metric numbers.
           * Run as separate top-level tweens (not inside the timeline) so we
           * can use a fixed delay without blocking the main sequence.
           *
           * gsap-react: use gsap.utils.selector for scoped queries.
           * gsap-performance: animate only text content — no layout.
           */
          q(".dash-count").forEach((el) => {
            const target = parseInt(
              (el as HTMLElement).dataset.target ?? "0",
              10
            );
            if (!target) return;

            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 0.9,
              delay: 0.38,
              ease: "power2.out",
              onUpdate() {
                (el as HTMLElement).textContent = String(
                  Math.round(obj.val)
                );
              },
            });
          });
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="dash-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bienvenido de nuevo{orgName ? `, ${orgName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Plan:{" "}
              <span className="inline-flex items-center rounded-full border border-leadby-500/30 bg-leadby-500/8 px-2 py-0.5 text-xs font-semibold capitalize text-leadby-600 dark:text-leadby-300">
                {plan}
              </span>
            </p>
          </div>

          {/* HubSpot status indicator */}
          {hubspotMetricsSource !== "sin_token" && (
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                hubspotMetricsSource === "hubspot"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/30 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "border-red-200 bg-red-50 text-red-600 dark:border-red-700/30 dark:bg-red-950/30 dark:text-red-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hubspotMetricsSource === "hubspot"
                    ? "animate-pulse bg-emerald-500"
                    : "bg-red-500"
                }`}
              />
              {hubspotMetricsSource === "hubspot"
                ? `HubSpot · ${hubspotDealsWon} deals · ${revenueFormatted} €`
                : "Error HubSpot"}
            </div>
          )}
        </div>
      </div>

      {/* ── Metric cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map(({ label, valor, icon: Icon, stroke, from, to, iconCls, spark }) => (
          <div
            key={label}
            className={[
              "dash-metric-card group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800/70",
              "bg-white dark:bg-gray-900/80 p-5 shadow-sm",
              "transition-all duration-300 hover:-translate-y-1",
              "hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)]",
            ].join(" ")}
          >
            {/* Gradient icon background */}
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {label}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${from} ${to}`}
              >
                <Icon className={`h-4 w-4 ${iconCls}`} />
              </div>
            </div>

            {/* Number + sparkline */}
            <div className="flex items-end justify-between">
              <p
                className="dash-count text-3xl font-bold tracking-tight text-gray-900 dark:text-white tabular-nums"
                data-target={valor}
              >
                {valor}
              </p>
              <Sparkline points={spark} color={stroke} />
            </div>
          </div>
        ))}
      </div>

      {/* HubSpot callout (sin_token) */}
      {hubspotMetricsSource === "sin_token" && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Configura el token de HubSpot en{" "}
          <Link
            href="/settings"
            className="font-semibold text-leadby-500 hover:text-leadby-600 transition-colors"
          >
            Ajustes
          </Link>{" "}
          para ver métricas CRM reales.
        </p>
      )}

      {/* ── Quick actions ───────────────────────────────────────────────── */}
      <div className="dash-actions rounded-2xl border border-gray-200 dark:border-gray-800/70 bg-white dark:bg-gray-900/80 p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          Acciones rápidas
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Nueva búsqueda */}
          <Link
            href="/prospecting"
            className="dash-action-item group flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-leadby-500/40 hover:shadow-[0_4px_16px_rgba(255,117,31,0.08)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 transition-transform duration-200 group-hover:scale-110">
              <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Nueva búsqueda
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Encuentra nuevos leads B2B
              </p>
            </div>
            <span className="text-gray-300 transition-transform duration-200 group-hover:translate-x-1 dark:text-gray-600">
              →
            </span>
          </Link>

          {/* Revisar borradores */}
          <Link
            href="/leads?tab=pendientes"
            className="dash-action-item group flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/40 hover:shadow-[0_4px_16px_rgba(245,158,11,0.08)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 transition-transform duration-200 group-hover:scale-110">
              <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Revisar borradores
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {leadsPendientes} correos pendientes
              </p>
            </div>
            <span className="text-gray-300 transition-transform duration-200 group-hover:translate-x-1 dark:text-gray-600">
              →
            </span>
          </Link>

          {/* Ver todos los leads */}
          <Link
            href="/leads"
            className="dash-action-item group flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-[0_4px_16px_rgba(34,197,94,0.08)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 transition-transform duration-200 group-hover:scale-110">
              <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Ver todos los leads
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalLeads} leads en total
              </p>
            </div>
            <span className="text-gray-300 transition-transform duration-200 group-hover:translate-x-1 dark:text-gray-600">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* ── Recent activity timeline ────────────────────────────────────── */}
      <div className="dash-activity rounded-2xl border border-gray-200 dark:border-gray-800/70 bg-white dark:bg-gray-900/80 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Actividad reciente
          </h2>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-leadby-500/30 hover:text-leadby-500 dark:text-gray-400"
          >
            <RefreshCw className="h-3 w-3" />
            Actualizar
          </button>
        </div>

        <ul className="space-y-1">
          {ACTIVITY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={i}
                className="dash-activity-item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${item.bg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.sub}
                  </p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 shrink-0 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
}
