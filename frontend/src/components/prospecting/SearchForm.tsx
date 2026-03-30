"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, MapPin, Building2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Modo = "google_maps" | "google_dorks";

interface SearchFormProps {
  organizacionId: string;
}

export function SearchForm({ organizacionId }: SearchFormProps) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("google_maps");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos para Google Maps
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [maxResults, setMaxResults] = useState(20);

  // Campos para Google Dorks
  const [dorkQuery, setDorkQuery] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body =
      modo === "google_maps"
        ? { organizacion_id: organizacionId, tipo: "google_maps", query, location, max_results: maxResults }
        : { organizacion_id: organizacionId, tipo: "google_dorks", dork_query: dorkQuery, max_results: maxResults };

    try {
      const res = await fetch("/api/webhooks/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar la búsqueda.");
        return;
      }

      // Redirigir a la página de seguimiento del job
      router.push(`/prospecting/${data.job_id}`);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Selector de modo */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setModo("google_maps")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            modo === "google_maps"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <MapPin className="w-4 h-4" />
          Google Maps
        </button>
        <button
          onClick={() => setModo("google_dorks")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            modo === "google_dorks"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Sparkles className="w-4 h-4" />
          Google Dorks
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {modo === "google_maps" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de negocio
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: fábricas de automoción, empresas de logística..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Madrid, Valencia, Barcelona..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Dork Query
            </label>
            <textarea
              required
              value={dorkQuery}
              onChange={(e) => setDorkQuery(e.target.value)}
              rows={3}
              placeholder={'Ej: site:es.linkedin.com/in "Director de Compras" "empresa de logística" "Madrid"'}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Usa operadores de búsqueda avanzada para encontrar perfiles específicos en LinkedIn.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Máximo de resultados
          </label>
          <select
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 resultados</option>
            <option value={20}>20 resultados</option>
            <option value={30}>30 resultados</option>
            <option value={50}>50 resultados</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors"
        >
          <Search className="w-4 h-4" />
          {loading ? "Iniciando búsqueda..." : "Buscar leads"}
        </button>
      </form>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-xs text-blue-700 font-medium mb-1">¿Cómo funciona?</p>
        <p className="text-xs text-blue-600">
          El motor de búsqueda navega automáticamente por Google Maps o Google Search,
          extrae datos públicos de empresas y los enriquece con Apollo.io para encontrar
          al director de compras. Los leads aparecen en tu bandeja listos para revisión.
        </p>
      </div>
    </div>
  );
}
