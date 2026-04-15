"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, CheckCircle, Eye } from "lucide-react";
import { LeadStatusBadge } from "./LeadStatusBadge";
import type { LeadConRelaciones } from "@/lib/types/app.types";

interface LeadsTableProps {
  leads: LeadConRelaciones[];
  onOpenDrawer: (lead: LeadConRelaciones) => void;
  onDiscard: (leadId: string) => Promise<void>;
  onGenerateDraft: (leadId: string) => Promise<void>;
}

export function LeadsTable({
  leads,
  onOpenDrawer,
  onDiscard,
  onGenerateDraft,
}: LeadsTableProps) {
  const [discardingId, setDiscardingId] = useState<string | null>(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState<string | null>(null);
  const [generatingDraftId, setGeneratingDraftId] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<{ leadId: string; message: string } | null>(
    null
  );

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

  async function handleGenerateDraft(leadId: string) {
    setGeneratingDraftId(leadId);
    setDraftError(null);

    try {
      await onGenerateDraft(leadId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar el borrador con IA.";
      setDraftError({ leadId, message });
    } finally {
      setGeneratingDraftId(null);
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
            const isDiscardingThis = discardingId === lead.id;
            const confirmingDiscard = confirmDiscardId === lead.id;
            const isGeneratingDraftThis = generatingDraftId === lead.id;
            const draftErrorForLead =
              draftError?.leadId === lead.id ? draftError.message : null;
            const canReviewDraft =
              Boolean(lead.borrador_email) &&
              (lead.estado === "pendiente_aprobacion" || lead.estado === "aprobado");
            const tecnologias = Array.isArray(empresa?.tecnologias)
              ? empresa.tecnologias.filter((item): item is string => typeof item === "string")
              : [];

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
                  {empresa?.dominio && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {empresa.dominio}
                    </p>
                  )}
                </td>

                {/* Sector */}
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {empresa?.sector ?? "—"}
                  </p>
                  {empresa?.ingresos_rango && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      Ingresos: {empresa.ingresos_rango}
                    </p>
                  )}
                  {tecnologias.length > 0 && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[220px]">
                      Tech: {tecnologias.slice(0, 2).join(", ")}
                      {tecnologias.length > 2 ? "..." : ""}
                    </p>
                  )}
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
                        {contacto.seniority && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase">
                            {contacto.seniority}
                          </span>
                        )}
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
                      {contacto.email_status && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                          Email: {contacto.email_status}
                        </p>
                      )}
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
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center justify-end gap-2">
                      {/* Revisar borrador en panel lateral */}
                      {canReviewDraft && (
                        <button
                          onClick={() => onOpenDrawer(lead)}
                          className="border border-leadby-500 text-leadby-600 hover:bg-leadby-500/5 font-medium px-3 py-1.5 rounded-lg transition-colors text-xs inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Revisar borrador
                        </button>
                      )}

                    {/* Esperando borrador */}
                    {lead.estado === "pendiente_aprobacion" &&
                      !lead.borrador_email && (
                        <button
                          onClick={() => handleGenerateDraft(lead.id)}
                          disabled={isGeneratingDraftThis}
                          className="text-xs px-3 py-1.5 rounded-lg border border-leadby-500/30 text-leadby-600 hover:bg-leadby-500/5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {isGeneratingDraftThis ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            "Generar borrador IA"
                          )}
                        </button>
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
                      lead.estado !== "enviado" &&
                      !canReviewDraft && (
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

                    {draftErrorForLead && (
                      <p className="text-[11px] text-red-500 dark:text-red-400 max-w-[240px] text-right">
                        {draftErrorForLead}
                      </p>
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
