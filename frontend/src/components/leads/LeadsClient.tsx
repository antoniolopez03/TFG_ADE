"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { LeadsTable } from "./LeadsTable";
import { EmailDrawer } from "./EmailDrawer";
import { LeadDetailsModal } from "./LeadDetailsModal";
import { CountUp } from "@/lib/animations/counter";
import type { LeadConRelaciones } from "@/lib/types/app.types";

// Register useGSAP plugin once
gsap.registerPlugin(useGSAP);

// ─── Constants ────────────────────────────────────────────────────────────────

const BULK_CHUNK_SIZE = 10;
const BULK_DELAY_MS = 15000;

type BulkProgressStatus = "idle" | "processing" | "waiting";
type BulkAction = "generate" | "discard" | null;

interface BulkProgress {
  current: number;
  total: number;
  status: BulkProgressStatus;
}

interface BulkNotice {
  type: "success" | "error";
  message: string;
}

interface DiscardLeadResult {
  ok: boolean;
  error?: string;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

interface Tab {
  label: string;
  value: string;
  filter: (leads: LeadConRelaciones[]) => LeadConRelaciones[];
}

const TABS: Tab[] = [
  { label: "Todos", value: "todos", filter: (l) => l },
  {
    label: "Pendientes",
    value: "pendientes",
    filter: (l) =>
      l.filter(
        (x) =>
          x.estado === "nuevo" || x.estado === "pendiente_aprobacion" || x.estado === "aprobado"
      ),
  },
  {
    label: "Enviados",
    value: "enviados",
    filter: (l) => l.filter((x) => x.estado === "enviado"),
  },
  {
    label: "Descartados",
    value: "descartados",
    filter: (l) => l.filter((x) => x.estado === "descartado"),
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface LeadsClientProps {
  leadsIniciales: LeadConRelaciones[];
  organizacionId: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LeadsClient({ leadsIniciales, organizacionId }: LeadsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabActivo = searchParams.get("tab") ?? "todos";

  // ── State ─────────────────────────────────────────────────────────────────

  const [leads, setLeads] = useState<LeadConRelaciones[]>(leadsIniciales);
  const [drawerLead, setDrawerLead] = useState<LeadConRelaciones | null>(null);
  const [detailsLead, setDetailsLead] = useState<LeadConRelaciones | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);
  const [progress, setProgress] = useState<BulkProgress>({
    current: 0,
    total: 0,
    status: "idle",
  });
  const [bulkNotice, setBulkNotice] = useState<BulkNotice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Refs for GSAP
  const headerRef = useRef<HTMLDivElement>(null);

  // ── GSAP — header entrance timeline ───────────────────────────────────────

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(".leads-title", {
        autoAlpha: 0,
        y: 20,
        duration: 0.5,
      })
        .from(
          ".leads-subtitle",
          { autoAlpha: 0, y: 14, duration: 0.4 },
          "-=0.28"
        )
        .from(
          ".leads-total-badge",
          { autoAlpha: 0, scale: 0.85, duration: 0.35 },
          "-=0.25"
        );
    },
    { scope: headerRef }
  );

  // ── Sync leads with server ─────────────────────────────────────────────────

  useEffect(() => {
    setLeads(leadsIniciales);
  }, [leadsIniciales]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const tabConfig = TABS.find((t) => t.value === tabActivo) ?? TABS[0];
  const isPendingTab = tabActivo === "pendientes";
  const leadsFiltrados = useMemo(() => tabConfig.filter(leads), [tabConfig, leads]);

  // Apply search query on top of tab filter
  const leadsSearched = useMemo(() => {
    if (!searchQuery.trim()) return leadsFiltrados;
    const q = searchQuery.toLowerCase();
    return leadsFiltrados.filter(
      (l) =>
        l.empresa_nombre?.toLowerCase().includes(q) ||
        l.contacto_nombre_completo?.toLowerCase().includes(q) ||
        l.contacto_email?.toLowerCase().includes(q) ||
        l.empresa_sector?.toLowerCase().includes(q) ||
        l.empresa_dominio?.toLowerCase().includes(q)
    );
  }, [leadsFiltrados, searchQuery]);

  // Clear search when switching tabs
  useEffect(() => {
    setSearchQuery("");
  }, [tabActivo]);

  // Keep selectedIds in sync with visible leads
  useEffect(() => {
    const visibleIds = new Set(leadsFiltrados.map((l) => l.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => visibleIds.has(id));
      const same =
        next.length === prev.length && next.every((id, idx) => id === prev[idx]);
      return same ? prev : next;
    });
  }, [leadsFiltrados]);

  useEffect(() => {
    if (!isPendingTab) setSelectedIds([]);
  }, [isPendingTab]);

  const selectableLeadIds = useMemo(() => {
    if (!isPendingTab) return [];
    return leadsFiltrados
      .filter(
        (l) =>
          (l.estado === "nuevo" || l.estado === "pendiente_aprobacion") && !l.email_borrador
      )
      .map((l) => l.id);
  }, [isPendingTab, leadsFiltrados]);

  const selectableLeadIdsSet = useMemo(() => new Set(selectableLeadIds), [selectableLeadIds]);

  const selectedEligibleIds = useMemo(
    () => selectedIds.filter((id) => selectableLeadIdsSet.has(id)),
    [selectedIds, selectableLeadIdsSet]
  );

  const allSelectableSelected =
    selectableLeadIds.length > 0 &&
    selectedEligibleIds.length === selectableLeadIds.length;

  const pendingCount = leads.filter(
    (l) => l.estado === "nuevo" || l.estado === "pendiente_aprobacion" || l.estado === "aprobado"
  ).length;

  // ── Tab navigation ─────────────────────────────────────────────────────────

  function setTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  // ── Lead mutations ─────────────────────────────────────────────────────────

  const markLeadsAsDiscarded = useCallback((leadIds: string[]) => {
    if (leadIds.length === 0) return;
    const idsSet = new Set(leadIds);
    setLeads((prev) =>
      prev.map((l) => (idsSet.has(l.id) ? { ...l, estado: "descartado" } : l))
    );
  }, []);

  const discardLeadRequest = useCallback(
    async (leadId: string): Promise<DiscardLeadResult> => {
      const res = await fetch("/api/leads/discard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, organizacion_id: organizacionId }),
      });
      if (res.ok) return { ok: true };
      const data = await res.json().catch(() => ({}));
      return {
        ok: false,
        error:
          typeof data.error === "string" && data.error.trim()
            ? data.error
            : "No se pudo descartar el lead.",
      };
    },
    [organizacionId]
  );

  const handleDiscard = useCallback(
    async (leadId: string) => {
      try {
        const result = await discardLeadRequest(leadId);
        if (!result.ok) {
          toast.error(result.error ?? "No se pudo descartar el lead.");
          return;
        }
        markLeadsAsDiscarded([leadId]);
        toast.success("Lead descartado correctamente.");
        router.refresh();
      } catch {
        toast.error("Error de conexión. Inténtalo de nuevo.");
      }
    },
    [discardLeadRequest, markLeadsAsDiscarded, router]
  );

  const handleDiscardedFromDrawer = useCallback(
    (leadId: string) => {
      markLeadsAsDiscarded([leadId]);
      router.refresh();
    },
    [markLeadsAsDiscarded, router]
  );

  const handleSent = useCallback(
    (leadId: string) => {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, estado: "enviado", email_borrador: null } : l
        )
      );
      router.refresh();
    },
    [router]
  );

  const handleGenerateDraft = useCallback(
    async (leadId: string) => {
      const res = await fetch("/api/webhooks/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, organizacion_id: organizacionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar el borrador con IA.");
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                estado: "pendiente_aprobacion",
                email_borrador:
                  typeof data.email_borrador === "string"
                    ? data.email_borrador
                    : l.email_borrador,
                email_asunto:
                  typeof data.email_asunto === "string"
                    ? data.email_asunto
                    : l.email_asunto,
              }
            : l
        )
      );
      router.refresh();
    },
    [organizacionId, router]
  );

  // ── Selection handlers ─────────────────────────────────────────────────────

  const handleToggleSelect = useCallback(
    (leadId: string) => {
      if (!isPendingTab || isProcessing || !selectableLeadIdsSet.has(leadId)) return;
      setBulkNotice(null);
      setSelectedIds((prev) =>
        prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
      );
    },
    [isPendingTab, isProcessing, selectableLeadIdsSet]
  );

  const handleToggleSelectAll = useCallback(() => {
    if (!isPendingTab || isProcessing || selectableLeadIds.length === 0) return;
    setBulkNotice(null);
    setSelectedIds((prev) => {
      if (allSelectableSelected)
        return prev.filter((id) => !selectableLeadIdsSet.has(id));
      const next = new Set(prev);
      selectableLeadIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  }, [allSelectableSelected, isPendingTab, isProcessing, selectableLeadIds, selectableLeadIdsSet]);

  const handleClearSelection = useCallback(() => {
    if (isProcessing) return;
    setSelectedIds([]);
  }, [isProcessing]);

  // ── Bulk generate ──────────────────────────────────────────────────────────

  const handleGenerateDraftsInBatches = useCallback(async () => {
    if (isProcessing) return;
    const idsToProcess = [...selectedEligibleIds];
    if (idsToProcess.length === 0) {
      const msg = "Selecciona al menos un lead pendiente para generar borradores.";
      setBulkNotice({ type: "error", message: msg });
      toast.error(msg);
      return;
    }
    setBulkNotice(null);
    setIsProcessing(true);
    setBulkAction("generate");
    setProgress({ current: 0, total: idsToProcess.length, status: "processing" });

    const chunks = chunkArray(idsToProcess, BULK_CHUNK_SIZE);
    let processed = 0, success = 0, failed = 0, firstErr: string | null = null;

    try {
      let ci = 0;
      for (const chunk of chunks) {
        setProgress({ current: processed, total: idsToProcess.length, status: "processing" });
        const results = await Promise.allSettled(chunk.map((id) => handleGenerateDraft(id)));
        for (const r of results) {
          processed++;
          if (r.status === "fulfilled") success++;
          else {
            failed++;
            if (!firstErr)
              firstErr = r.reason instanceof Error ? r.reason.message : "Error desconocido.";
          }
        }
        const isLast = ci === chunks.length - 1;
        setProgress({
          current: processed,
          total: idsToProcess.length,
          status: isLast ? "processing" : "waiting",
        });
        if (!isLast) await delay(BULK_DELAY_MS);
        ci++;
      }
      setSelectedIds([]);
      if (success > 0 && failed === 0) {
        setBulkNotice({
          type: "success",
          message: `Se generaron ${success} borrador${success === 1 ? "" : "es"} con IA.`,
        });
      } else if (success > 0) {
        setBulkNotice({
          type: "success",
          message: `Completado: ${success} generado${success === 1 ? "" : "s"}, ${failed} fallo${failed === 1 ? "" : "s"}.`,
        });
        toast.error(firstErr ? `Incompleto: ${firstErr}` : "Terminó con errores en algunos leads.");
      } else {
        const msg = firstErr ? `No se generó ningún borrador. ${firstErr}` : "No se generó ningún borrador. Inténtalo de nuevo.";
        setBulkNotice({ type: "error", message: msg });
        toast.error(msg);
      }
      router.refresh();
    } catch {
      const msg = "Error inesperado en la operación masiva de borradores.";
      setBulkNotice({ type: "error", message: msg });
      toast.error(msg);
    } finally {
      setIsProcessing(false);
      setBulkAction(null);
      setProgress({ current: 0, total: 0, status: "idle" });
    }
  }, [handleGenerateDraft, isProcessing, router, selectedEligibleIds]);

  // ── Bulk discard ───────────────────────────────────────────────────────────

  const handleDiscardSelectedInBulk = useCallback(async () => {
    if (isProcessing) return;
    const idsToProcess = [...selectedEligibleIds];
    if (idsToProcess.length === 0) {
      const msg = "Selecciona al menos un lead para descartar.";
      setBulkNotice({ type: "error", message: msg });
      toast.error(msg);
      return;
    }
    setBulkNotice(null);
    setIsProcessing(true);
    setBulkAction("discard");
    setProgress({ current: 0, total: idsToProcess.length, status: "processing" });

    const chunks = chunkArray(idsToProcess, BULK_CHUNK_SIZE);
    const discarded: string[] = [];
    let processed = 0, failed = 0, firstErr: string | null = null;

    try {
      for (const chunk of chunks) {
        const results = await Promise.allSettled(
          chunk.map(async (id) => {
            const r = await discardLeadRequest(id);
            if (!r.ok) throw new Error(r.error ?? "No se pudo descartar.");
            return id;
          })
        );
        for (const r of results) {
          processed++;
          if (r.status === "fulfilled") discarded.push(r.value);
          else {
            failed++;
            if (!firstErr)
              firstErr = r.reason instanceof Error ? r.reason.message : "Error desconocido.";
          }
        }
        setProgress({ current: processed, total: idsToProcess.length, status: "processing" });
      }
      if (discarded.length > 0) markLeadsAsDiscarded(discarded);
      setSelectedIds([]);
      if (discarded.length > 0 && failed === 0) {
        setBulkNotice({
          type: "success",
          message: `Se descartaron ${discarded.length} lead${discarded.length === 1 ? "" : "s"}.`,
        });
      } else if (discarded.length > 0) {
        setBulkNotice({
          type: "success",
          message: `Completado: ${discarded.length} descartado${discarded.length === 1 ? "" : "s"}, ${failed} fallo${failed === 1 ? "" : "s"}.`,
        });
        toast.error(firstErr ? `Incompleto: ${firstErr}` : "Terminó con errores.");
      } else {
        const msg = firstErr ? `No se descartó ningún lead. ${firstErr}` : "No se descartó ningún lead. Inténtalo de nuevo.";
        setBulkNotice({ type: "error", message: msg });
        toast.error(msg);
      }
      router.refresh();
    } catch {
      const msg = "Error inesperado en la operación masiva de descarte.";
      setBulkNotice({ type: "error", message: msg });
      toast.error(msg);
    } finally {
      setIsProcessing(false);
      setBulkAction(null);
      setProgress({ current: 0, total: 0, status: "idle" });
    }
  }, [discardLeadRequest, isProcessing, markLeadsAsDiscarded, router, selectedEligibleIds]);

  const progressMessage = useMemo(() => {
    if (!isProcessing || progress.total === 0) return "";
    if (bulkAction === "discard")
      return `Descartando leads… (${progress.current}/${progress.total})`;
    if (progress.status === "waiting")
      return `Esperando siguiente lote… (${progress.current}/${progress.total})`;
    return `Generando borradores… (${progress.current}/${progress.total})`;
  }, [bulkAction, isProcessing, progress]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      {/* ── Header — GSAP entrance timeline ──────────────────────────── */}
      <div ref={headerRef} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="leads-title text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Leads
          </h1>
          <p className="leads-subtitle text-sm text-gray-500 dark:text-gray-400 mt-1">
            Revisa y envía los prospectos descubiertos por el motor de prospección.
          </p>
        </div>
        <span className="leads-total-badge text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-3 py-1.5 rounded-full">
          {leads.length} total
        </span>
      </div>

      {/* ── Tabs — framer-motion layoutId sliding indicator ──────────── */}
      <div className="relative flex items-center gap-1 mb-4 border-b border-gray-100 dark:border-gray-800">
        {TABS.map((tab) => {
          const isActive = tab.value === tabActivo;
          return (
            <button
              key={tab.value}
              onClick={() => setTab(tab.value)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 -mb-px ${
                isActive
                  ? "text-leadby-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}

              {/* Pending count badge */}
              {tab.value === "pendientes" && pendingCount > 0 && (
                <motion.span
                  layout
                  className="bg-leadby-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none"
                >
                  {pendingCount}
                </motion.span>
              )}

              {/* Sliding active indicator */}
              {isActive && (
                <motion.div
                  layoutId="leads-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-leadby-500 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
            </button>
          );
        })}

        {/* ── Result counter — CountUp re-animates on count change ────── */}
        <div className="ml-auto flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 pb-2.5">
          <CountUp
            key={`${tabActivo}-${leadsSearched.length}`}
            to={leadsSearched.length}
            duration={0.5}
            className="tabular-nums"
          />
          <span>resultado{leadsSearched.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* ── Search bar ────────────────────────────────────────────────── */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por empresa, contacto o sector…"
          className="w-full pl-9 pr-9 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-leadby-400 dark:focus:border-leadby-500 transition-colors"
        />

        {/* Animated clear button */}
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bulk action panel (pendientes tab only) ───────────────────── */}
      {isPendingTab && (
        <div className="mb-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {selectedEligibleIds.length} lead
                {selectedEligibleIds.length === 1 ? "" : "s"} seleccionado
                {selectedEligibleIds.length === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Solo se pueden seleccionar leads en estado pendiente y sin borrador.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSelection}
                disabled={isProcessing || selectedEligibleIds.length === 0}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Limpiar selección
              </button>

              <button
                onClick={handleGenerateDraftsInBatches}
                disabled={isProcessing || selectedEligibleIds.length === 0}
                className="text-xs px-3 py-1.5 rounded-lg bg-leadby-500 text-white hover:bg-leadby-600 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                {isProcessing && bulkAction === "generate" ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Procesando lotes…
                  </>
                ) : (
                  "Generar todos los borradores"
                )}
              </button>

              <button
                onClick={handleDiscardSelectedInBulk}
                disabled={isProcessing || selectedEligibleIds.length === 0}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                {isProcessing && bulkAction === "discard" ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Descartando…
                  </>
                ) : (
                  "Descartar todos"
                )}
              </button>
            </div>
          </div>

          {isProcessing && progressMessage && (
            <p className="mt-3 text-xs text-leadby-600 dark:text-leadby-400">
              {progressMessage}
            </p>
          )}

          {bulkNotice && (
            <p
              className={`mt-3 text-xs ${
                bulkNotice.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              {bulkNotice.message}
            </p>
          )}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <LeadsTable
        leads={leadsSearched}
        showBulkSelection={isPendingTab}
        selectedIds={selectedEligibleIds}
        selectableCount={selectableLeadIds.length}
        allSelectableSelected={allSelectableSelected}
        isProcessingBulk={isProcessing}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onOpenDetails={setDetailsLead}
        onOpenDrawer={setDrawerLead}
        onDiscard={handleDiscard}
        onGenerateDraft={handleGenerateDraft}
      />

      {/* ── Modals / Drawers ──────────────────────────────────────────── */}
      <LeadDetailsModal lead={detailsLead} onClose={() => setDetailsLead(null)} />

      <EmailDrawer
        lead={drawerLead}
        onClose={() => setDrawerLead(null)}
        onDiscarded={handleDiscardedFromDrawer}
        onSent={handleSent}
      />
    </div>
  );
}
