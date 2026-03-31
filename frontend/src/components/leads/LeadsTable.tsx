"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ExternalLink, Sparkles, CheckCircle, XCircle, Mail } from "lucide-react";
import type { LeadEstado } from "@/lib/types/app.types";

const ESTADO_LABELS: Record<LeadEstado, { label: string; color: string }> = {
  nuevo: { label: "Nuevo", color: "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60" },
  enriqueciendo: { label: "Enriqueciendo...", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200" },
  pendiente_aprobacion: { label: "Pendiente", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200" },
  aprobado: { label: "Aprobado", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200" },
  enviado: { label: "Enviado", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200" },
  descartado: { label: "Descartado", color: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-200" },
};

const FILTROS: { label: string; valor: string | undefined }[] = [
  { label: "Todos", valor: undefined },
  { label: "Nuevos", valor: "nuevo" },
  { label: "Pendientes", valor: "pendiente_aprobacion" },
  { label: "Enviados", valor: "enviado" },
  { label: "Descartados", valor: "descartado" },
];

type Lead = {
  id: string;
  estado: string;
  email_borrador: string | null;
  email_enviado_at: string | null;
  created_at: string;
  global_empresas: { nombre: string; dominio: string | null; ciudad: string | null; sector: string | null } | null;
  global_contactos: { nombre: string | null; apellidos: string | null; cargo: string | null; email: string | null; linkedin_url: string | null } | null;
};

interface LeadsTableProps {
  leadsIniciales: Lead[];
  organizacionId: string;
  estadoInicial?: string;
}

export function LeadsTable({ leadsIniciales, organizacionId, estadoInicial }: LeadsTableProps) {
  const [filtroActivo, setFiltroActivo] = useState<string | undefined>(estadoInicial);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  const leadsFiltrados = filtroActivo
    ? leadsIniciales.filter((l) => l.estado === filtroActivo)
    : leadsIniciales;

  async function handleEnrich(leadId: string) {
    setEnrichingId(leadId);
    try {
      await fetch("/api/webhooks/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, organizacion_id: organizacionId }),
      });
    } finally {
      setEnrichingId(null);
    }
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTROS.map(({ label, valor }) => (
          <button
            key={label}
            onClick={() => setFiltroActivo(valor)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              filtroActivo === valor
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-black/60 border-black/10 hover:border-black/20 dark:bg-white/5 dark:text-white/60 dark:border-white/10 dark:hover:border-white/20"
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-black/50 dark:text-white/50">
          {leadsFiltrados.length} resultado{leadsFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabla */}
      {leadsFiltrados.length === 0 ? (
        <div className="rounded-xl border border-black/5 bg-white/90 p-12 text-center shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-black/50 dark:text-white/50">No hay leads con este filtro.</p>
          <Link href="/prospecting" className="mt-3 inline-block text-sm text-leadby-500 hover:text-leadby-600">
            Iniciar nueva búsqueda →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/5 bg-white/90 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">Descubierto</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {leadsFiltrados.map((lead) => {
                const empresa = lead.global_empresas;
                const contacto = lead.global_contactos;
                const estadoConfig = ESTADO_LABELS[lead.estado as LeadEstado] ?? ESTADO_LABELS.nuevo;

                return (
                  <tr key={lead.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{empresa?.nombre ?? "—"}</p>
                      <p className="text-xs text-black/50 dark:text-white/50">
                        {empresa?.ciudad && <span>{empresa.ciudad} · </span>}
                        {empresa?.sector ?? "Sector desconocido"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {contacto ? (
                        <div>
                          <p className="font-medium text-foreground">
                            {[contacto.nombre, contacto.apellidos].filter(Boolean).join(" ") || "—"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-black/50 dark:text-white/50">{contacto.cargo ?? "Cargo desconocido"}</p>
                            {contacto.linkedin_url && (
                              <a href={contacto.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 text-leadby-400 hover:text-leadby-500" />
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-black/50 dark:text-white/50 italic">Sin contacto</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", estadoConfig.color)}>
                        {estadoConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-black/50 dark:text-white/50">
                      {new Date(lead.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {lead.estado === "nuevo" && (
                          <button
                            onClick={() => handleEnrich(lead.id)}
                            disabled={enrichingId === lead.id}
                            title="Enriquecer con IA"
                            className="rounded-md p-1.5 text-black/40 transition-colors hover:bg-black/5 hover:text-leadby-500 disabled:opacity-50 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-leadby-400"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        )}
                        {lead.estado === "pendiente_aprobacion" && (
                          <Link
                            href={`/leads/${lead.id}`}
                            title="Revisar y aprobar"
                            className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/leads/${lead.id}`}
                          className="px-2 py-1 text-xs text-leadby-500 hover:text-leadby-600"
                        >
                          Ver
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
