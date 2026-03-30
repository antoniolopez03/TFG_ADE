"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ExternalLink, Sparkles, CheckCircle, XCircle, Mail } from "lucide-react";
import type { LeadEstado } from "@/lib/types/app.types";

const ESTADO_LABELS: Record<LeadEstado, { label: string; color: string }> = {
  nuevo: { label: "Nuevo", color: "bg-gray-100 text-gray-600" },
  enriqueciendo: { label: "Enriqueciendo...", color: "bg-blue-100 text-blue-700" },
  pendiente_aprobacion: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  aprobado: { label: "Aprobado", color: "bg-green-100 text-green-700" },
  enviado: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
  descartado: { label: "Descartado", color: "bg-red-100 text-red-600" },
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
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTROS.map(({ label, valor }) => (
          <button
            key={label}
            onClick={() => setFiltroActivo(valor)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              filtroActivo === valor
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">
          {leadsFiltrados.length} resultado{leadsFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabla */}
      {leadsFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No hay leads con este filtro.</p>
          <Link href="/prospecting" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            Iniciar nueva búsqueda →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Empresa</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Contacto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Descubierto</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leadsFiltrados.map((lead) => {
                const empresa = lead.global_empresas;
                const contacto = lead.global_contactos;
                const estadoConfig = ESTADO_LABELS[lead.estado as LeadEstado] ?? ESTADO_LABELS.nuevo;

                return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{empresa?.nombre ?? "—"}</p>
                      <p className="text-xs text-gray-400">
                        {empresa?.ciudad && <span>{empresa.ciudad} · </span>}
                        {empresa?.sector ?? "Sector desconocido"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {contacto ? (
                        <div>
                          <p className="font-medium text-gray-800">
                            {[contacto.nombre, contacto.apellidos].filter(Boolean).join(" ") || "—"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-400">{contacto.cargo ?? "Cargo desconocido"}</p>
                            {contacto.linkedin_url && (
                              <a href={contacto.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 text-blue-400 hover:text-blue-600" />
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Sin contacto</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", estadoConfig.color)}>
                        {estadoConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(lead.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {lead.estado === "nuevo" && (
                          <button
                            onClick={() => handleEnrich(lead.id)}
                            disabled={enrichingId === lead.id}
                            title="Enriquecer con IA"
                            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
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
                          className="text-xs text-blue-600 hover:underline px-2 py-1"
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
