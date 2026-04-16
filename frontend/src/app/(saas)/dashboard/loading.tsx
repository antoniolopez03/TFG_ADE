/**
 * Dashboard skeleton — Fase 10, Plan UI/UX.
 *
 * Replica fielmente la estructura de DashboardClient:
 *  • Header con título + badge de plan + indicador HubSpot.
 *  • Grid 4 tarjetas de métricas (sparkline incluida).
 *  • Sección acciones rápidas con 3 ítems.
 *  • Timeline de actividad reciente con 5 entradas.
 *
 * Usa la clase .skeleton (globals.css) en vez de animate-pulse para el
 * efecto de luz deslizante (shimmer) de mayor calidad visual.
 */
export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="skeleton h-7 w-56 rounded-lg" />
          <div className="skeleton h-5 w-28 rounded-full mt-2" />
        </div>
        {/* HubSpot badge */}
        <div className="skeleton h-7 w-48 rounded-full" />
      </div>

      {/* ── Metric cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800/70
                       bg-white dark:bg-gray-900/80 p-5 shadow-sm"
          >
            {/* Label + icon */}
            <div className="flex items-start justify-between mb-3">
              <div className="skeleton h-3.5 w-28 rounded" />
              <div className="skeleton h-9 w-9 rounded-xl" />
            </div>

            {/* Number + sparkline */}
            <div className="flex items-end justify-between">
              <div className="skeleton h-9 w-14 rounded-lg" />
              {/* Sparkline placeholder */}
              <div className="skeleton h-7 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800/70
                      bg-white dark:bg-gray-900/80 p-6 shadow-sm">
        <div className="skeleton h-5 w-36 rounded mb-4" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-200
                         dark:border-gray-700 p-4"
            >
              {/* Icon */}
              <div className="skeleton h-10 w-10 rounded-xl flex-shrink-0" />
              {/* Text */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
              {/* Arrow */}
              <div className="skeleton h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent activity ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800/70
                      bg-white dark:bg-gray-900/80 p-6 shadow-sm">
        {/* Header row */}
        <div className="mb-5 flex items-center justify-between">
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-7 w-24 rounded-lg" />
        </div>

        {/* Activity items */}
        <ul className="space-y-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl p-3"
            >
              {/* Icon */}
              <div className="skeleton mt-0.5 h-7 w-7 rounded-lg flex-shrink-0" />
              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
                <div className="skeleton h-3.5 w-48 rounded" />
                <div className="skeleton h-3 w-36 rounded" />
              </div>
              {/* Timestamp */}
              <div className="skeleton h-3.5 w-16 rounded mt-0.5 flex-shrink-0" />
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
