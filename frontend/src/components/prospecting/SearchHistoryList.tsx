import { createClient } from "@/lib/supabase/request-client";
import { SearchHistoryTableClient } from "./SearchHistoryTableClient";

interface SearchHistoryListProps {
  organizacionId: string;
}

export async function SearchHistoryList({ organizacionId }: SearchHistoryListProps) {
  const supabase = createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("id, estado, created_at, fuente")
    .eq("organizacion_id", organizacionId)
    .order("created_at", { ascending: false })
    .limit(100);

  // Agrupar por día + fuente para aproximar sesiones de búsqueda sin tabla de trabajos.
  const grupos = new Map<
    string,
    { fecha: string; fuente: string; total: number; estados: Record<string, number> }
  >();

  for (const lead of leads ?? []) {
    const fecha = new Date(lead.created_at);
    const dia = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(
      fecha.getDate()
    ).padStart(2, "0")}`;
    const fuente = lead.fuente === "lookalike" ? "lookalike" : "prospeccion";
    const key = `${dia}-${fuente}`;

    if (!grupos.has(key)) {
      grupos.set(key, { fecha: lead.created_at, fuente, total: 0, estados: {} });
    }

    const g = grupos.get(key)!;
    g.total++;
    g.estados[lead.estado] = (g.estados[lead.estado] ?? 0) + 1;
  }

  const historial = Array.from(grupos.entries())
    .slice(0, 5)
    .map(([grupoId, g]) => ({ grupoId, ...g }));

  if (historial.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Aún no hay búsquedas registradas. ¡Inicia tu primera prospección!
        </p>
      </div>
    );
  }

  return <SearchHistoryTableClient historial={historial} />;
}

