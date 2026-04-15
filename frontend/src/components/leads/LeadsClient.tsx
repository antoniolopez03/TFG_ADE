"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LeadsTable } from "./LeadsTable";
import { EmailDrawer } from "./EmailDrawer";
import { LeadDetailsModal } from "./LeadDetailsModal";
import type { LeadConRelaciones } from "@/lib/types/app.types";

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
  if (chunkSize <= 0) {
    return [items];
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

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
      l.filter((x) => x.estado === "pendiente_aprobacion" || x.estado === "aprobado"),
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

interface LeadsClientProps {
  leadsIniciales: LeadConRelaciones[];
  organizacionId: string;
}

export function LeadsClient({
  leadsIniciales,
  organizacionId,
}: LeadsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabActivo = searchParams.get("tab") ?? "todos";

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

  useEffect(() => {
    setLeads(leadsIniciales);
  }, [leadsIniciales]);

  const tabConfig = TABS.find((t) => t.value === tabActivo) ?? TABS[0];
  const isPendingTab = tabActivo === "pendientes";
  const leadsFiltrados = useMemo(() => tabConfig.filter(leads), [tabConfig, leads]);

  useEffect(() => {
    const visibleIds = new Set(leadsFiltrados.map((lead) => lead.id));
    setSelectedIds((prev) => {
      const next = prev.filter((leadId) => visibleIds.has(leadId));
      const isSameSelection =
        next.length === prev.length && next.every((leadId, index) => leadId === prev[index]);

      return isSameSelection ? prev : next;
    });
  }, [leadsFiltrados]);

  useEffect(() => {
    if (!isPendingTab) {
      setSelectedIds([]);
    }
  }, [isPendingTab]);

  const selectableLeadIds = useMemo(
    () => {
      if (!isPendingTab) {
        return [];
      }

      return leadsFiltrados
        .filter((lead) => lead.estado === "pendiente_aprobacion" && !lead.borrador_email)
        .map((lead) => lead.id);
    },
    [isPendingTab, leadsFiltrados]
  );

  const selectableLeadIdsSet = useMemo(
    () => new Set(selectableLeadIds),
    [selectableLeadIds]
  );

  const selectedEligibleIds = useMemo(
    () => selectedIds.filter((leadId) => selectableLeadIdsSet.has(leadId)),
    [selectedIds, selectableLeadIdsSet]
  );

  const allSelectableSelected =
    selectableLeadIds.length > 0 &&
    selectedEligibleIds.length === selectableLeadIds.length;

  function setTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  const markLeadsAsDiscarded = useCallback((leadIds: string[]) => {
    if (leadIds.length === 0) {
      return;
    }

    const idsSet = new Set(leadIds);
    setLeads((prev) =>
      prev.map((lead) =>
        idsSet.has(lead.id) ? { ...lead, estado: "descartado" } : lead
      )
    );
  }, []);

  const discardLeadRequest = useCallback(
    async (leadId: string): Promise<DiscardLeadResult> => {
      const res = await fetch("/api/leads/discard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, organizacion_id: organizacionId }),
      });

      if (res.ok) {
        return { ok: true };
      }

      const data = await res.json().catch(() => ({}));
      return {
        ok: false,
        error:
          typeof data.error === "string" && data.error.trim().length > 0
            ? data.error
            : "No se pudo descartar el lead.",
      };
    },
    [organizacionId]
  );

  const handleDiscard = useCallback(
    async (leadId: string) => {
      try {
        const discarded = await discardLeadRequest(leadId);
        if (!discarded.ok) {
          toast.error(discarded.error ?? "No se pudo descartar el lead.");
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
          l.id === leadId ? { ...l, estado: "enviado", borrador_email: null } : l
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

      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo generar el borrador con IA.");
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                borrador_email:
                  typeof data.email_borrador === "string"
                    ? data.email_borrador
                    : lead.borrador_email,
                email_asunto:
                  typeof data.email_asunto === "string"
                    ? data.email_asunto
                    : lead.email_asunto,
              }
            : lead
        )
      );
    },
    [organizacionId]
  );

  const handleToggleSelect = useCallback(
    (leadId: string) => {
      if (!isPendingTab || isProcessing || !selectableLeadIdsSet.has(leadId)) {
        return;
      }

      setBulkNotice(null);
      setSelectedIds((prev) =>
        prev.includes(leadId)
          ? prev.filter((currentLeadId) => currentLeadId !== leadId)
          : [...prev, leadId]
      );
    },
    [isPendingTab, isProcessing, selectableLeadIdsSet]
  );

  const handleToggleSelectAll = useCallback(() => {
    if (!isPendingTab || isProcessing || selectableLeadIds.length === 0) {
      return;
    }

    setBulkNotice(null);
    setSelectedIds((prev) => {
      if (allSelectableSelected) {
        return prev.filter((leadId) => !selectableLeadIdsSet.has(leadId));
      }

      const next = new Set(prev);
      selectableLeadIds.forEach((leadId) => {
        next.add(leadId);
      });

      return Array.from(next);
    });
  }, [allSelectableSelected, isPendingTab, isProcessing, selectableLeadIds, selectableLeadIdsSet]);

  const handleClearSelection = useCallback(() => {
    if (isProcessing) {
      return;
    }

    setSelectedIds([]);
  }, [isProcessing]);

  const handleGenerateDraftsInBatches = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    const idsToProcess = [...selectedEligibleIds];
    if (idsToProcess.length === 0) {
      const message = "Selecciona al menos un lead pendiente para generar borradores.";
      setBulkNotice({
        type: "error",
        message,
      });
      toast.error(message);
      return;
    }

    setBulkNotice(null);
    setIsProcessing(true);
    setBulkAction("generate");
    setProgress({ current: 0, total: idsToProcess.length, status: "processing" });

    const chunks = chunkArray(idsToProcess, BULK_CHUNK_SIZE);
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    let firstErrorMessage: string | null = null;

    try {
      let chunkIndex = 0;

      for (const chunk of chunks) {
        setProgress({
          current: processedCount,
          total: idsToProcess.length,
          status: "processing",
        });

        const results = await Promise.allSettled(
          chunk.map((leadId) => handleGenerateDraft(leadId))
        );

        for (const result of results) {
          processedCount += 1;
          if (result.status === "fulfilled") {
            successCount += 1;
          } else {
            failedCount += 1;
            if (!firstErrorMessage) {
              firstErrorMessage =
                result.reason instanceof Error
                  ? result.reason.message
                  : "Error desconocido al generar borradores en lote.";
            }
          }
        }

        const isLastChunk = chunkIndex === chunks.length - 1;
        setProgress({
          current: processedCount,
          total: idsToProcess.length,
          status: isLastChunk ? "processing" : "waiting",
        });

        if (!isLastChunk) {
          await delay(BULK_DELAY_MS);
        }

        chunkIndex += 1;
      }

      setSelectedIds([]);

      if (successCount > 0 && failedCount === 0) {
        setBulkNotice({
          type: "success",
          message: `Se generaron ${successCount} borrador${
            successCount === 1 ? "" : "es"
          } con IA.`,
        });
      } else if (successCount > 0) {
        setBulkNotice({
          type: "success",
          message: `Proceso completado: ${successCount} borrador${
            successCount === 1 ? "" : "es"
          } generado${successCount === 1 ? "" : "s"} y ${failedCount} fallo${
            failedCount === 1 ? "" : "s"
          }.`,
        });
        toast.error(
          firstErrorMessage
            ? `Operación masiva incompleta: ${firstErrorMessage}`
            : "La operación masiva terminó con errores en algunos leads."
        );
      } else {
        const message = firstErrorMessage
          ? `No se pudo generar ningún borrador. ${firstErrorMessage}`
          : "No se pudo generar ningún borrador. Intenta de nuevo en unos minutos.";
        setBulkNotice({
          type: "error",
          message,
        });
        toast.error(message);
      }

      router.refresh();
    } catch {
      const message = "Error inesperado en la operación masiva de borradores.";
      setBulkNotice({
        type: "error",
        message,
      });
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setBulkAction(null);
      setProgress({ current: 0, total: 0, status: "idle" });
    }
  }, [handleGenerateDraft, isProcessing, router, selectedEligibleIds]);

  const handleDiscardSelectedInBulk = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    const idsToProcess = [...selectedEligibleIds];
    if (idsToProcess.length === 0) {
      const message = "Selecciona al menos un lead para descartar.";
      setBulkNotice({
        type: "error",
        message,
      });
      toast.error(message);
      return;
    }

    setBulkNotice(null);
    setIsProcessing(true);
    setBulkAction("discard");
    setProgress({ current: 0, total: idsToProcess.length, status: "processing" });

    const chunks = chunkArray(idsToProcess, BULK_CHUNK_SIZE);
    const discardedIds: string[] = [];
    let processedCount = 0;
    let failedCount = 0;
    let firstErrorMessage: string | null = null;

    try {
      for (const chunk of chunks) {
        const results = await Promise.allSettled(
          chunk.map(async (leadId) => {
            const discarded = await discardLeadRequest(leadId);
            if (!discarded.ok) {
              throw new Error(discarded.error ?? "No se pudo descartar el lead.");
            }

            return leadId;
          })
        );

        for (const result of results) {
          processedCount += 1;
          if (result.status === "fulfilled") {
            discardedIds.push(result.value);
          } else {
            failedCount += 1;
            if (!firstErrorMessage) {
              firstErrorMessage =
                result.reason instanceof Error
                  ? result.reason.message
                  : "Error desconocido al descartar leads en lote.";
            }
          }
        }

        setProgress({
          current: processedCount,
          total: idsToProcess.length,
          status: "processing",
        });
      }

      if (discardedIds.length > 0) {
        markLeadsAsDiscarded(discardedIds);
      }
      setSelectedIds([]);

      if (discardedIds.length > 0 && failedCount === 0) {
        setBulkNotice({
          type: "success",
          message: `Se descartaron ${discardedIds.length} lead${
            discardedIds.length === 1 ? "" : "s"
          } correctamente.`,
        });
      } else if (discardedIds.length > 0) {
        setBulkNotice({
          type: "success",
          message: `Proceso completado: ${discardedIds.length} lead${
            discardedIds.length === 1 ? "" : "s"
          } descartado${discardedIds.length === 1 ? "" : "s"} y ${failedCount} fallo${
            failedCount === 1 ? "" : "s"
          }.`,
        });
        toast.error(
          firstErrorMessage
            ? `Operación masiva incompleta: ${firstErrorMessage}`
            : "La operación masiva terminó con errores en algunos leads."
        );
      } else {
        const message = firstErrorMessage
          ? `No se pudo descartar ningún lead. ${firstErrorMessage}`
          : "No se pudo descartar ningún lead. Intenta de nuevo.";
        setBulkNotice({
          type: "error",
          message,
        });
        toast.error(message);
      }

      router.refresh();
    } catch {
      const message = "Error inesperado en la operación masiva de descarte.";
      setBulkNotice({
        type: "error",
        message,
      });
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setBulkAction(null);
      setProgress({ current: 0, total: 0, status: "idle" });
    }
  }, [discardLeadRequest, isProcessing, markLeadsAsDiscarded, router, selectedEligibleIds]);

  const pendingCount = leads.filter(
    (l) => l.estado === "pendiente_aprobacion" || l.estado === "aprobado"
  ).length;

  const progressMessage = useMemo(() => {
    if (!isProcessing || progress.total === 0) {
      return "";
    }

    if (bulkAction === "discard") {
      return `Descartando leads... (${progress.current}/${progress.total})`;
    }

    if (progress.status === "waiting") {
      return `Esperando para el siguiente lote... (${progress.current}/${progress.total})`;
    }

    return `Generando borradores... (${progress.current}/${progress.total})`;
  }, [bulkAction, isProcessing, progress]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-100 dark:border-gray-800 pb-0">
        {TABS.map((tab) => {
          const isActive = tab.value === tabActivo;
          return (
            <button
              key={tab.value}
              onClick={() => setTab(tab.value)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                isActive
                  ? "text-leadby-500 border-b-2 border-leadby-500 -mb-px"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
              {tab.value === "pendientes" && pendingCount > 0 && (
                <span className="bg-leadby-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 pb-2.5">
          {leadsFiltrados.length} resultado
          {leadsFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

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
                  Procesando lotes...
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
                  Descartando...
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
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {bulkNotice.message}
          </p>
        )}
        </div>
      )}

      {/* Tabla */}
      <LeadsTable
        leads={leadsFiltrados}
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

      <LeadDetailsModal
        lead={detailsLead}
        onClose={() => setDetailsLead(null)}
      />

      {/* Email Drawer */}
      <EmailDrawer
        lead={drawerLead}
        onClose={() => setDrawerLead(null)}
        onDiscarded={handleDiscardedFromDrawer}
        onSent={handleSent}
      />
    </div>
  );
}
