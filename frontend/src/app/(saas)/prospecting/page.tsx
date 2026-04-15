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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Prospección</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Encuentra nuevos clientes potenciales para tu pipeline.
        </p>
      </div>

      {/* Tarjetas de búsqueda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Búsqueda Manual */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
              Búsqueda Manual
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Define sector, ubicación y tamaño para encontrar empresas y decisores.
            </p>
          </div>
          <ManualSearchForm organizacionId={orgId} />
        </div>

        {/* Búsqueda IA Lookalike */}
        <LookalikeTrigger />
      </div>

      {/* Búsquedas recientes */}
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">
          Búsquedas recientes
        </h2>
        {orgId ? (
          <SearchHistoryList organizacionId={orgId} />
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Aún no hay búsquedas registradas. ¡Inicia tu primera prospección!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

