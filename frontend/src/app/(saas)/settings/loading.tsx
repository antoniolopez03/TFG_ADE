/**
 * Settings skeleton — Fase 10, Plan UI/UX.
 * Replica la estructura de SettingsTabs: header, tabs, formulario card.
 * Usa .skeleton (shimmer) en lugar de animate-pulse.
 */
export default function SettingsLoading() {
  return (
    <div className="p-8 max-w-3xl">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="skeleton h-7 w-40 rounded-lg" />
        <div className="skeleton h-4 w-56 rounded mt-2" />
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-gray-100
                      dark:border-gray-800 mb-6">
        {[80, 72, 56, 88].map((w, i) => (
          <div
            key={i}
            className="skeleton h-10 rounded mx-2"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* ── Formulario principal ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900/80 rounded-xl border
                      border-gray-200 dark:border-gray-800/70 p-6 shadow-sm space-y-5">
        {/* Título de sección */}
        <div className="skeleton h-5 w-52 rounded" />

        {/* Campos de formulario */}
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="skeleton h-4 w-32 rounded mb-2" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
        ))}

        {/* Botón guardar */}
        <div className="skeleton h-9 w-36 rounded-lg" />
      </div>

      {/* ── Segunda card (CRM / equipo) ───────────────────────────────────── */}
      <div className="mt-4 bg-white dark:bg-gray-900/80 rounded-xl border
                      border-gray-200 dark:border-gray-800/70 p-6 shadow-sm space-y-4">
        <div className="skeleton h-5 w-44 rounded" />

        {/* Status indicator + descripción */}
        <div className="flex items-center gap-3">
          <div className="skeleton h-5 w-5 rounded-full flex-shrink-0" />
          <div className="skeleton h-4 w-48 rounded" />
        </div>

        {[1, 2].map((i) => (
          <div key={i}>
            <div className="skeleton h-4 w-28 rounded mb-2" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
        ))}

        <div className="skeleton h-9 w-40 rounded-lg" />
      </div>

    </div>
  );
}
