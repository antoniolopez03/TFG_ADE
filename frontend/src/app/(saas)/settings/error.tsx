"use client";

import { AlertTriangle } from "lucide-react";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-8">
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Error al cargar la configuración
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {error.message || "Ocurrió un error inesperado. Inténtalo de nuevo."}
        </p>
        <button
          onClick={reset}
          className="bg-leadby-500 hover:bg-leadby-600 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
