import { createClient } from "@/lib/supabase/server";

interface SearchHistoryListProps {
  organizacionId: string;
}

export async function SearchHistoryList({ organizacionId }: SearchHistoryListProps) {
  const supabase = createClient();

  const { data: leads } = await supabase
    .from("leads_prospectados")
    .select("id, estado, created_at, n8n_job_id")
    .eq("organizacion_id", organizacionId)
    .not("n8n_job_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  // Agrupar por n8n_job_id para obtener sesiones de búsqueda
  const grupos = new Map<
    string,
    { fecha: string; total: number; estados: Record<string, number> }
  >();

  for (const lead of leads ?? []) {
    const key = lead.n8n_job_id as string;
    if (!grupos.has(key)) {
      grupos.set(key, { fecha: lead.created_at, total: 0, estados: {} });
    }
    const g = grupos.get(key)!;
    g.total++;
    g.estados[lead.estado] = (g.estados[lead.estado] ?? 0) + 1;
  }

  const historial = Array.from(grupos.entries())
    .slice(0, 5)
    .map(([jobId, g]) => ({ jobId, ...g }));

  if (historial.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Aún no hay búsquedas registradas. ¡Inicia tu primera prospección!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Leads encontrados
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Estado general
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {historial.map(({ jobId, fecha, total, estados }) => {
            const enviados = estados["enviado"] ?? 0;
            const pendientes = estados["pendiente_aprobacion"] ?? 0;

            return (
              <tr key={jobId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(fecha).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 dark:text-white">{total}</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">leads</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {enviados > 0 && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {enviados} enviados
                      </span>
                    )}
                    {pendientes > 0 && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        {pendientes} pendientes
                      </span>
                    )}
                    {enviados === 0 && pendientes === 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">En proceso</span>
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
