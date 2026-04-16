/**
 * Prospecting skeleton — Fase 10, Plan UI/UX.
 * Replica la estructura de la página de prospección:
 * header, grid 2 cards (búsqueda + lookalike), historial.
 * Usa .skeleton (shimmer) en lugar de animate-pulse.
 */
export default function ProspectingLoading() {
  return (
    <div className="p-8">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="skeleton h-7 w-52 rounded-lg" />
        <div className="skeleton h-4 w-80 rounded mt-2" />
      </div>

      {/* ── Cards de búsqueda ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Formulario de búsqueda manual */}
        <div className="bg-white dark:bg-gray-900/80 rounded-xl border
                        border-gray-200 dark:border-gray-800/70 p-6 shadow-sm">
          <div className="skeleton h-5 w-40 rounded mb-5" />

          {/* 3 inputs en grid */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="skeleton h-4 w-16 rounded mb-2" />
                <div className="skeleton h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>

          {/* Botón buscar */}
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>

        {/* Card lookalike */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800/70
                        bg-white dark:bg-gray-900/80 p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-5">
            {/* Icono */}
            <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-5 w-48 rounded mb-2" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded mt-1" />
            </div>
          </div>
          <div className="skeleton h-12 w-full rounded-xl mt-4" />
        </div>

      </div>

      {/* ── Historial ─────────────────────────────────────────────────────── */}
      <div className="skeleton h-5 w-36 rounded mb-4" />
      <div className="bg-white dark:bg-gray-900/80 rounded-xl border
                      border-gray-200 dark:border-gray-800/70 overflow-hidden shadow-sm">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b
                       border-gray-50 dark:border-gray-800/50 last:border-0"
          >
            <div className="skeleton h-4 w-36 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
            <div className="ml-auto skeleton h-6 w-28 rounded-full" />
          </div>
        ))}
      </div>

    </div>
  );
}
