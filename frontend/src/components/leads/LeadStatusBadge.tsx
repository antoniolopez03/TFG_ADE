"use client";

import type { LeadEstado } from "@/lib/types/app.types";

// ─── Config ───────────────────────────────────────────────────────────────────

type StatusConfig = {
  label: string;
  /** Tailwind classes for the outer badge pill */
  badgeClass: string;
  /** Tailwind classes for the small indicator dot */
  dotClass: string;
};

const ESTADO_MAP: Record<LeadEstado, StatusConfig> = {
  /** Slate — recién creado, pendiente de generar borrador */
  nuevo: {
    label: "Nuevo",
    badgeClass:
      "bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-500/20",
    dotClass: "bg-slate-400",
  },
  /** Amber — pulsing dot to draw attention */
  pendiente_aprobacion: {
    label: "Pendiente",
    badgeClass:
      "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/20",
    dotClass: "bg-amber-400 animate-pulse-orange",
  },
  /** Blue — pulsing dot (borrador listo, esperando revisión) */
  aprobado: {
    label: "Aprobado",
    badgeClass:
      "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20",
    dotClass: "bg-blue-400 animate-pulse-orange",
  },
  /** Emerald — static dot */
  enviado: {
    label: "Enviado",
    badgeClass:
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  /** Red — muted static dot */
  descartado: {
    label: "Descartado",
    badgeClass:
      "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-500/20",
    dotClass: "bg-red-400 opacity-60",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

interface LeadStatusBadgeProps {
  estado: LeadEstado;
}

export function LeadStatusBadge({ estado }: LeadStatusBadgeProps) {
  const config = ESTADO_MAP[estado] ?? ESTADO_MAP.pendiente_aprobacion;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.badgeClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`}
      />
      {config.label}
    </span>
  );
}
