/**
 * Leads skeleton — Fase 10, Plan UI/UX.
 * Replica la estructura de LeadsTable: header, tabs de estado, tabla.
 * Usa .skeleton (shimmer) en lugar de animate-pulse.
 */
export default function LeadsLoading() {
  return (
    <div className="p-8">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="skeleton h-7 w-48 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded mt-2" />
        </div>
        {/* Badge contador */}
        <div className="skeleton h-7 w-20 rounded-full" />
      </div>

      {/* ── Tabs de estado ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-100 dark:border-gray-800 pb-0">
        {[80, 100, 120, 72, 96].map((w, i) => (
          <div
            key={i}
            className="skeleton h-10 rounded mx-1"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900/80 rounded-xl border
                      border-gray-200 dark:border-gray-800/70 overflow-hidden shadow-sm">
        {/* Cabecera */}
        <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50
                        dark:bg-gray-800/50 h-10" />

        {/* Filas */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b
                       border-gray-50 dark:border-gray-800/50 last:border-0"
          >
            {/* Empresa */}
            <div className="flex-1">
              <div className="skeleton h-4 w-36 rounded" />
            </div>

            {/* Contacto */}
            <div className="w-32">
              <div className="skeleton h-4 w-28 rounded" />
              <div className="skeleton h-3 w-20 rounded mt-1.5" />
            </div>

            {/* Email */}
            <div className="w-40">
              <div className="skeleton h-4 w-36 rounded" />
            </div>

            {/* Estado badge */}
            <div className="w-28">
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>

            {/* Fecha */}
            <div className="w-24">
              <div className="skeleton h-4 w-20 rounded" />
            </div>

            {/* Acciones */}
            <div className="w-32 flex justify-end gap-2">
              <div className="skeleton h-7 w-16 rounded-lg" />
              <div className="skeleton h-7 w-14 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
