"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { LeadStatusBadge } from "./LeadStatusBadge";
import type { LeadConRelaciones } from "@/lib/types/app.types";

interface LeadsTableProps {
  leads: LeadConRelaciones[];
  onApprove: (leadId: string) => Promise<void>;
  onOpenDrawer: (lead: LeadConRelaciones) => void;
  onDiscard: (leadId: string) => Promise<void>;
}

export function LeadsTable({
  leads,
  onApprove,
  onOpenDrawer,
  onDiscard,
}: LeadsTableProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [discardingId, setDiscardingId] = useState<string | null>(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState<string | null>(null);

  async function handleApprove(leadId: string) {
    setApprovingId(leadId);
    try {
      await onApprove(leadId);
    } finally {
      setApprovingId(null);
    }
  }

  async function handleDiscard(leadId: string) {
    if (confirmDiscardId !== leadId) {
      setConfirmDiscardId(leadId);
      return;
    }
    setConfirmDiscardId(null);
    setDiscardingId(leadId);
    try {
      await onDiscard(leadId);
    } finally {
      setDiscardingId(null);
    }
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">No hay leads con este filtro.</p>
        <Link
          href="/prospecting"
          className="mt-3 inline-block text-sm text-leadby-500 hover:text-leadby-600"
        >
          Iniciar nueva búsqueda →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Empresa
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Sector
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Contacto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Fecha
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {leads.map((lead) => {
            const empresa = lead.global_empresas;
            const contacto = lead.global_contactos;
            const contactoNombre = [contacto?.nombre, contacto?.apellidos]
              .filter(Boolean)
              .join(" ");
            const isApprovingThis = approvingId === lead.id;
            const isDiscardingThis = discardingId === lead.id;
            const confirmingDiscard = confirmDiscardId === lead.id;

            return (
              <tr
                key={lead.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {/* Empresa */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {empresa?.nombre ?? "—"}
                  </p>
                </td>

                {/* Sector */}
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {empresa?.sector ?? "—"}
                  </p>
                </td>

                {/* Contacto */}
                <td className="px-4 py-3">
                  {contacto ? (
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contactoNombre || "—"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {contacto.cargo ?? "—"}
                        </p>
                        {contacto.linkedin_url && (
                          <a
                            href={contacto.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3 text-leadby-400 hover:text-leadby-500" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sin contacto</p>
                  )}
                </td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <LeadStatusBadge estado={lead.estado} />
                </td>

                {/* Fecha */}
                <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString("es-ES")}
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {/* Aprobar (pendiente_aprobacion -> aprobado) */}
                    {lead.estado === "pendiente_aprobacion" &&
                      lead.borrador_email && (
                      <button
                        onClick={() => handleApprove(lead.id)}
                        disabled={isApprovingThis}
                        className="bg-leadby-500 hover:bg-leadby-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isApprovingThis ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Aprobando...
                          </>
                        ) : (
                          "Aprobar"
                        )}
                      </button>
                    )}

                    {/* Revisar borrador (ya aprobado) */}
                    {lead.estado === "aprobado" &&
                      lead.borrador_email && (
                        <button
                          onClick={() => onOpenDrawer(lead)}
                          className="border border-leadby-500 text-leadby-600 hover:bg-leadby-500/5 font-medium px-3 py-1.5 rounded-lg transition-colors text-xs"
                        >
                          Revisar borrador →
                        </button>
                      )}

                    {/* Esperando borrador */}
                    {lead.estado === "pendiente_aprobacion" &&
                      !lead.borrador_email && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Esperando borrador...
                        </span>
                      )}

                    {/* Enviado */}
                    {lead.estado === "enviado" && (
                      <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Enviado ✓
                      </span>
                    )}

                    {/* Descartar */}
                    {lead.estado !== "descartado" &&
                      lead.estado !== "enviado" && (
                        <button
                          onClick={() => handleDiscard(lead.id)}
                          disabled={isDiscardingThis}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            confirmingDiscard
                              ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium"
                              : "text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                          }`}
                        >
                          {isDiscardingThis
                            ? "..."
                            : confirmingDiscard
                            ? "¿Confirmar?"
                            : "Descartar"}
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
