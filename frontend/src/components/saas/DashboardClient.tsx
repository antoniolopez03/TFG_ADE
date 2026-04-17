"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useCallback } from "react";
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
  hubspotMetricsSource: "hubspot" | "sin_token" | "error";
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
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardClient({
  orgName,
  plan,
  totalLeads,
  leadsEnviados,
  leadsPendientes,
  hubspotDealsWon,
  hubspotMetricsSource,
}: DashboardClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hubspotConnected = hubspotMetricsSource === "hubspot";

  // Metric cards data
  const METRICS = [
    {
      label:    "Total leads",
      valor:    totalLeads,
      icon:     Users,
      iconBg:   "bg-blue-500/15",
      iconCls:  "text-blue-400",
      sub:      "leads registrados",
      isStatic: false,
    },
    {
      label:    "Correos enviados",
      valor:    leadsEnviados,
      icon:     Send,
      iconBg:   "bg-emerald-500/15",
      iconCls:  "text-emerald-400",
      sub:      "emails despachados",
      isStatic: false,
    },
    {
      label:    "Pendientes aprobación",
      valor:    leadsPendientes,
      icon:     TrendingUp,
      iconBg:   "bg-amber-500/15",
      iconCls:  "text-amber-400",
      sub:      "esperando revisión",
      isStatic: false,
    },
    {
      label:    "Deals ganados",
      valor:    hubspotConnected ? hubspotDealsWon : 0,
      icon:     Building2,
      iconBg:   "bg-violet-500/15",
      iconCls:  "text-violet-400",
      sub:      hubspotConnected ? "contratos cerrados" : "Conecta HubSpot en Configuración",
      isStatic: !hubspotConnected,
    },
  ];

  // ── Card hover handlers ────────────────────────────────────────────────────

  const handleCardEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const card = e.currentTarget;
    const badge  = card.querySelector<HTMLElement>(".metric-icon-badge");
    const number = card.querySelector<HTMLElement>(".metric-value");

    gsap.to(card, {
      boxShadow: "0 0 0 1px rgba(255,255,255,0.18), 0 12px 36px rgba(0,0,0,0.3)",
      duration: 0.25,
      ease: "power2.out",
    });
    if (badge)  gsap.to(badge,  { scale: 1.14, duration: 0.28, ease: "back.out(2.5)" });
    if (number) gsap.to(number, { scale: 1.05, duration: 0.22, ease: "power2.out", transformOrigin: "left center" });
  }, []);

  const handleCardLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const card = e.currentTarget;
    const badge  = card.querySelector<HTMLElement>(".metric-icon-badge");
    const number = card.querySelector<HTMLElement>(".metric-value");

    gsap.to(card, {
      boxShadow: "none",
      duration: 0.3,
      ease: "power2.out",
    });
    if (badge)  gsap.to(badge,  { scale: 1, duration: 0.3, ease: "power2.out" });
    if (number) gsap.to(number, { scale: 1, duration: 0.28, ease: "power2.out" });
  }, []);

  // ── Refresh handler ────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    const q = gsap.utils.selector(containerRef);

    if (prefersReducedMotion()) {
      setTimeout(() => setIsRefreshing(false), 1200);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => setIsRefreshing(false),
    });

    tl
      .to(q(".dash-activity-item"), {
        autoAlpha: 0,
        x: -14,
        stagger: 0.045,
        duration: 0.22,
        ease: "power2.in",
      })
      .to({}, { duration: 0.75 })
      .fromTo(
        q(".dash-activity-item"),
        { autoAlpha: 0, x: 18 },
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.07,
          duration: 0.32,
          ease: "power3.out",
        }
      );
  }, [isRefreshing]);

  // ── GSAP entrance animation ────────────────────────────────────────────────
  useGSAP(
    () => {
      const q = gsap.utils.selector(containerRef);
      const mm = gsap.matchMedia();

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
              ],
              { autoAlpha: 1, clearProps: "transform" }
            );
            return;
          }

          gsap.set(q(".dash-header"),        { autoAlpha: 0, y: 12 });
          gsap.set(q(".dash-metric-card"),   { autoAlpha: 0, y: 20, willChange: "transform" });
          gsap.set(q(".dash-actions"),       { autoAlpha: 0, y: 14 });
          gsap.set(q(".dash-action-item"),   { autoAlpha: 0, x: -10 });
          gsap.set(q(".dash-activity"),      { autoAlpha: 0, y: 14 });
          gsap.set(q(".dash-activity-item"), { autoAlpha: 0, y: 8 });

          const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 0.48 },
          });

          tl
            .addLabel("header", 0)
            .to(q(".dash-header"), { autoAlpha: 1, y: 0 }, "header")

            .addLabel("cards", "header+=0.18")
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
                clearProps: "willChange",
              },
              "cards"
            )

            .addLabel("actions", "cards+=0.35")
            .to(q(".dash-actions"),     { autoAlpha: 1, y: 0, duration: 0.4 },                 "actions")
            .to(q(".dash-action-item"), { autoAlpha: 1, x: 0, stagger: 0.09, duration: 0.35 }, "actions+=0.1")

            .addLabel("activity", "actions+=0.25")
            .to(q(".dash-activity"),      { autoAlpha: 1, y: 0, duration: 0.4 },                 "activity")
            .to(q(".dash-activity-item"), { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.32 }, "activity+=0.1");

          // CountUp
          q(".dash-count").forEach((el) => {
            const target = parseInt((el as HTMLElement).dataset.target ?? "0", 10);
            if (!target) return;
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 0.9,
              delay: 0.38,
              ease: "power2.out",
              onUpdate() {
                (el as HTMLElement).textContent = String(Math.round(obj.val));
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
        </div>
      </div>

      {/* ── Metric cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map(({ label, valor, icon: Icon, iconBg, iconCls, sub, isStatic }) => (
          <div
            key={label}
            className="dash-metric-card rounded-2xl border border-gray-200 dark:border-gray-800/70 bg-white dark:bg-gray-900 p-6 shadow-sm transition-[transform] duration-300 hover:-translate-y-1 cursor-default"
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
          >
            {/* Top row: icon + label */}
            <div className="flex items-center justify-between mb-4">
              <div className={`metric-icon-badge flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconCls}`} />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
            </div>

            {/* Large number */}
            {isStatic ? (
              <p className="metric-value text-4xl font-bold text-gray-900 dark:text-white">—</p>
            ) : (
              <p
                className="metric-value dash-count text-4xl font-bold text-gray-900 dark:text-white tabular-nums"
                data-target={valor}
              >
                {valor}
              </p>
            )}

            {/* Secondary text */}
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{sub}</p>
          </div>
        ))}
      </div>

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
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Nueva búsqueda</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Encuentra nuevos leads B2B</p>
            </div>
            <span className="text-gray-300 transition-transform duration-200 group-hover:translate-x-1 dark:text-gray-600">→</span>
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
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Revisar borradores</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{leadsPendientes} correos pendientes</p>
            </div>
            <span className="text-gray-300 transition-transform duration-200 group-hover:translate-x-1 dark:text-gray-600">→</span>
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
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Ver todos los leads</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{totalLeads} leads en total</p>
            </div>
            <span className="text-gray-300 transition-transform duration-200 group-hover:translate-x-1 dark:text-gray-600">→</span>
          </Link>
        </div>
      </div>

      {/* ── Recent activity timeline ────────────────────────────────────── */}
      <div className="dash-activity rounded-2xl border border-gray-200 dark:border-gray-800/70 bg-white dark:bg-gray-900/80 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Actividad reciente
          </h2>
          <button
            type="button"
            disabled={isRefreshing}
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-leadby-500/30 hover:text-leadby-500 dark:text-gray-400 disabled:pointer-events-none disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Actualizando…" : "Actualizar"}
          </button>
        </div>

        <ul className="space-y-0.5">
          {ACTIVITY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={i}
                className="dash-activity-item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.sub}
                  </p>
                </div>
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
