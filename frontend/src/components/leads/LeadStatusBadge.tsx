"use client";

import { Loader2 } from "lucide-react";
import type { LeadEstado } from "@/lib/types/app.types";

const ESTADO_MAP: Record<
  LeadEstado,
  { label: string; className: string; spinner?: boolean }
> = {
  nuevo: {
    label: "Nuevo",
    className: "bg-gray-100 text-gray-600",
  },
  enriqueciendo: {
    label: "Enriqueciendo",
    className: "bg-blue-100 text-blue-700",
    spinner: true,
  },
  pendiente_aprobacion: {
    label: "Pendiente de revisión",
    className: "bg-amber-100 text-amber-700",
  },
  aprobado: {
    label: "Aprobado",
    className: "bg-leadby-500/10 text-leadby-600 border border-leadby-500/20",
  },
  enviado: {
    label: "Enviado",
    className: "bg-green-100 text-green-700",
  },
  descartado: {
    label: "Descartado",
    className: "bg-red-50 text-red-400",
  },
};

interface LeadStatusBadgeProps {
  estado: LeadEstado;
}

export function LeadStatusBadge({ estado }: LeadStatusBadgeProps) {
  const config = ESTADO_MAP[estado] ?? ESTADO_MAP.nuevo;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.spinner && (
        <Loader2 className="w-3 h-3 animate-spin" />
      )}
      {config.label}
    </span>
  );
}
