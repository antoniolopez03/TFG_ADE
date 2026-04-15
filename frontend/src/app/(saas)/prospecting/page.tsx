import { createClient } from "@/lib/supabase/request-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { ManualSearchForm } from "@/components/prospecting/ManualSearchForm";
import { LookalikeTrigger } from "@/components/prospecting/LookalikeTrigger";
import { SearchHistoryList } from "@/components/prospecting/SearchHistoryList";

export default async function ProspectingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  const orgId = membresia?.organizacion_id ?? null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nueva Prospección
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Encuentra nuevos clientes potenciales para tu pipeline.
        </p>
      </div>

      {/* Search cards — headings are now inside each component */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Manual search */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800/70 bg-white dark:bg-gray-900/80 p-6 shadow-sm">
          <ManualSearchForm organizacionId={orgId} />
        </div>

        {/* AI Lookalike */}
        <LookalikeTrigger />
      </div>

      {/* Recent searches */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Búsquedas recientes
        </h2>
        {orgId ? (
          <SearchHistoryList organizacionId={orgId} />
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800/70 bg-white dark:bg-gray-900/80 p-8 text-center shadow-sm">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Aún no hay búsquedas registradas. ¡Inicia tu primera prospección!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

