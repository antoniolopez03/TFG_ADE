"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Building2, MapPin } from "lucide-react";

const INPUT_CLASS =
  "border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

interface ManualSearchFormProps {
  organizacionId?: string | null;
}

const TAMANO_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export function ManualSearchForm({ organizacionId }: ManualSearchFormProps) {
  const router = useRouter();
  const [sector, setSector] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tamano, setTamano] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!sector.trim() || !ubicacion.trim()) {
      setError("Completa sector y ubicación antes de buscar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/prospecting/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizacion_id: organizacionId ?? undefined,
          tipo: "apollo_search",
          sector: sector.trim(),
          ubicacion: ubicacion.trim(),
          tamano: tamano || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al iniciar la búsqueda. Inténtalo de nuevo.");
        return;
      }

      router.push("/leads");
    } catch {
      setError("Error de conexión. Comprueba tu red e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Sector / tipo de negocio
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ej: metalurgia, logística, automoción"
              className={`${INPUT_CLASS} pl-9`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Ubicación
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Madrid, Barcelona, España"
              className={`${INPUT_CLASS} pl-9`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Tamaño de empresa (opcional)
          </label>
          <select
            value={tamano}
            onChange={(e) => setTamano(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Sin filtro de tamaño</option>
            {TAMANO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        LeadBy analiza tu sector con IA y genera una lista de empresas y decisores
        relevantes. Los resultados aparecen en tu bandeja listos para revisión y envío.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-leadby-500 hover:bg-leadby-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Buscando decisores...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Iniciar búsqueda
          </>
        )}
      </button>
    </form>
  );
}
