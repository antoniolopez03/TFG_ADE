"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ExternalLink,
  Loader2,
  CheckCircle,
  Eye,
  UserRound,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import { LeadStatusBadge } from "./LeadStatusBadge";
import type { LeadConRelaciones } from "@/lib/types/app.types";

// Register GSAP React plugin once
gsap.registerPlugin(useGSAP);

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeadsTableProps {
  leads: LeadConRelaciones[];
  showBulkSelection: boolean;
  selectedIds: string[];
  selectableCount: number;
  allSelectableSelected: boolean;
  isProcessingBulk: boolean;
  onToggleSelect: (leadId: string) => void;
  onToggleSelectAll: () => void;
  onOpenDetails: (lead: LeadConRelaciones) => void;
  onOpenDrawer: (lead: LeadConRelaciones) => void;
  onDiscard: (leadId: string) => Promise<void>;
  onGenerateDraft: (leadId: string) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isInteractiveRowTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, a, input, textarea, select, [role='button']"));
}

// ─── Row animation variants ───────────────────────────────────────────────────

const rowVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      // Cap stagger at 12 rows so long lists don't feel sluggish
      delay: Math.min(i, 12) * 0.03,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyLeadsState() {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP timeline: icon bounces in → title fades up → description → CTA
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".empty-icon", {
        autoAlpha: 0,
        scale: 0.5,
        rotation: -12,
        duration: 0.55,
      })
        .from(
          ".empty-title",
          { autoAlpha: 0, y: 14, duration: 0.4 },
          "-=0.25"
        )
        .from(
          ".empty-desc",
          { autoAlpha: 0, y: 10, duration: 0.35 },
          "-=0.2"
        )
        .from(
          ".empty-cta",
          { autoAlpha: 0, y: 8, duration: 0.35 },
          "-=0.2"
        );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-16 px-8 text-center"
    >
      {/* Animated icon */}
      <div className="empty-icon flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <SearchX className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>

      <p className="empty-title text-sm font-medium text-gray-700 dark:text-gray-300">
        No hay leads con este filtro
      </p>

      <p className="empty-desc text-xs text-gray-400 dark:text-gray-500 max-w-xs">
        Prueba a cambiar el filtro de la pestaña o inicia una nueva búsqueda en
        el motor de prospección.
      </p>

      <Link
        href="/prospecting"
        className="empty-cta inline-flex items-center gap-1.5 text-sm font-medium text-leadby-500 hover:text-leadby-600 transition-colors"
      >
        Iniciar nueva búsqueda
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LeadsTable({
  leads,
  showBulkSelection,
  selectedIds,
  selectableCount,
  allSelectableSelected,
  isProcessingBulk,
  onToggleSelect,
  onToggleSelectAll,
  onOpenDetails,
  onOpenDrawer,
  onDiscard,
  onGenerateDraft,
}: LeadsTableProps) {
  const [discardingId, setDiscardingId] = useState<string | null>(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState<string | null>(null);
  const [generatingDraftId, setGeneratingDraftId] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<{ leadId: string; message: string } | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

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
      toast.success("Borrador generado con éxito.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo generar el borrador con IA.";
      setDraftError({ leadId, message });
      toast.error(message);
    } finally {
      setGeneratingDraftId(null);
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  if (leads.length === 0) {
    return <EmptyLeadsState />;
  }

  // ── Table ──────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <table className="w-full text-sm">
        {/* ── Head ─────────────────────────────────────────────────────── */}
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            {showBulkSelection && (
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelectableSelected}
                  onChange={onToggleSelectAll}
                  disabled={isProcessingBulk || selectableCount === 0}
                  className="h-4 w-4 rounded border-gray-300 text-leadby-500 focus:ring-leadby-500 disabled:cursor-not-allowed"
                  aria-label="Seleccionar todos los leads elegibles"
                />
              </th>
            )}
            {["Empresa", "Sector", "Contacto", "Estado", "Fecha"].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500"
              >
                {col}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Acciones
            </th>
          </tr>
        </thead>

        {/* ── Body — AnimatePresence drives staggered enter / exit ─────── */}
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          <AnimatePresence mode="sync">
            {leads.map((lead, i) => {
              const contactoNombre = lead.contacto_nombre_completo ?? "";
              const isDiscardingThis = discardingId === lead.id;
              const confirmingDiscard = confirmDiscardId === lead.id;
              const isGeneratingDraftThis = generatingDraftId === lead.id;
              const draftErrorForLead =
                draftError?.leadId === lead.id ? draftError.message : null;
              const isSelected = selectedIds.includes(lead.id);
              const canSelectForBulk =
                (lead.estado === "nuevo" || lead.estado === "pendiente_aprobacion") &&
                !lead.email_borrador;
              const canReviewDraft =
                Boolean(lead.email_borrador) &&
                (lead.estado === "nuevo" || lead.estado === "pendiente_aprobacion" || lead.estado === "aprobado");

              return (
                <motion.tr
                  key={lead.id}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={(event) => {
                    if (isInteractiveRowTarget(event.target)) return;
                    onOpenDetails(lead);
                  }}
                >
                  {/* Checkbox */}
                  {showBulkSelection && (
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(lead.id)}
                        disabled={isProcessingBulk || !canSelectForBulk}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-leadby-500 focus:ring-leadby-500 disabled:cursor-not-allowed"
                        aria-label={`Seleccionar lead ${lead.empresa_nombre ?? lead.id}`}
                      />
                    </td>
                  )}

                  {/* Empresa */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {lead.empresa_nombre ?? "—"}
                    </p>
                    {lead.empresa_dominio && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {lead.empresa_dominio}
                      </p>
                    )}
                  </td>

                  {/* Sector */}
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {lead.empresa_sector ?? "—"}
                    </p>
                    {lead.empresa_facturacion_rango && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        Facturación: {lead.empresa_facturacion_rango}
                      </p>
                    )}
                  </td>

                  {/* Contacto */}
                  <td className="px-4 py-3">
                    {lead.contacto_nombre_completo || lead.contacto_email || lead.contacto_cargo ? (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {contactoNombre || "—"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lead.contacto_cargo ?? "—"}
                          </p>
                          {lead.contacto_linkedin_url && (
                            <a
                              href={lead.contacto_linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 text-leadby-400 hover:text-leadby-500" />
                            </a>
                          )}
                        </div>
                        {lead.contacto_email && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {lead.contacto_email}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                        Sin contacto
                      </p>
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
                        {/* Ver perfil */}
                        <button
                          onClick={() => onOpenDetails(lead)}
                          className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800 font-medium px-3 py-1.5 rounded-lg transition-colors text-xs inline-flex items-center gap-1.5"
                        >
                          <UserRound className="w-3.5 h-3.5" />
                          Ver perfil
                        </button>

                        {/* Revisar borrador */}
                        {canReviewDraft && (
                          <button
                            onClick={() => onOpenDrawer(lead)}
                            disabled={isProcessingBulk}
                            className="border border-leadby-500 text-leadby-600 hover:bg-leadby-500/5 font-medium px-3 py-1.5 rounded-lg transition-colors text-xs inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Revisar borrador
                          </button>
                        )}

                        {/* Generar borrador IA */}
                        {(lead.estado === "nuevo" || lead.estado === "pendiente_aprobacion") &&
                          !lead.email_borrador && (
                          <button
                            onClick={() => handleGenerateDraft(lead.id)}
                            disabled={isGeneratingDraftThis || isProcessingBulk}
                            className="text-xs px-3 py-1.5 rounded-lg border border-leadby-500/30 text-leadby-600 hover:bg-leadby-500/5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {isGeneratingDraftThis ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Generando…
                              </>
                            ) : (
                              "Generar borrador IA"
                            )}
                          </button>
                        )}

                        {/* Enviado */}
                        {lead.estado === "enviado" && (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
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
                              disabled={isDiscardingThis || isProcessingBulk}
                              className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                confirmingDiscard
                                  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium"
                                  : "text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                              }`}
                            >
                              {isDiscardingThis
                                ? "…"
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
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
