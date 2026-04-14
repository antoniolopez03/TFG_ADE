"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeadsTable } from "./LeadsTable";
import { EmailDrawer } from "./EmailDrawer";
import type { LeadConRelaciones } from "@/lib/types/app.types";

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
    filter: (l) => l.filter((x) => x.estado === "pendiente_aprobacion"),
  },
  {
    label: "Aprobados",
    value: "aprobados",
    filter: (l) =>
      l.filter((x) => x.estado === "aprobado" && x.borrador_email !== null),
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
  countsByEstado: Record<string, number>;
}

export function LeadsClient({
  leadsIniciales,
  organizacionId,
  countsByEstado,
}: LeadsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabActivo = searchParams.get("tab") ?? "todos";

  const [leads, setLeads] = useState<LeadConRelaciones[]>(leadsIniciales);
  const [drawerLead, setDrawerLead] = useState<LeadConRelaciones | null>(null);

  useEffect(() => {
    setLeads(leadsIniciales);
  }, [leadsIniciales]);

  const tabConfig = TABS.find((t) => t.value === tabActivo) ?? TABS[0];
  const leadsFiltrados = tabConfig.filter(leads);

  function setTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  const handleApprove = useCallback(
    async (leadId: string) => {
      const res = await fetch("/api/leads/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, organizacion_id: organizacionId }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, estado: "aprobado" } : l))
        );
      }
    },
    [organizacionId]
  );

  const handleDiscard = useCallback(
    async (leadId: string) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) return;

      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, estado: "descartado" } : l
        )
      );

      await fetch(`/api/leads/discard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, organizacion_id: organizacionId }),
      });
    },
    [organizacionId]
  );

  const handleSent = useCallback((leadId: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, estado: "enviado", borrador_email: null } : l
      )
    );
  }, []);

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

  const pendingCount =
    countsByEstado["pendiente_aprobacion"] ??
    leads.filter((l) => l.estado === "pendiente_aprobacion").length;

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

      {/* Tabla */}
      <LeadsTable
        leads={leadsFiltrados}
        onApprove={handleApprove}
        onOpenDrawer={setDrawerLead}
        onDiscard={handleDiscard}
        onGenerateDraft={handleGenerateDraft}
      />

      {/* Email Drawer */}
      <EmailDrawer
        lead={drawerLead}
        onClose={() => setDrawerLead(null)}
        onSent={handleSent}
      />
    </div>
  );
}
