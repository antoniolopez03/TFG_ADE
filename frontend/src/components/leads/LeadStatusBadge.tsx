"use client";

import { Loader2 } from "lucide-react";
import type { LeadEstado } from "@/lib/types/app.types";

const ESTADO_MAP: Record<
  LeadEstado,
  { label: string; className: string; spinner?: boolean }
> = {
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
  const config = ESTADO_MAP[estado] ?? ESTADO_MAP.pendiente_aprobacion;

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
