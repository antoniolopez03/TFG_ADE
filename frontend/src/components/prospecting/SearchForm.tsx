"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, MapPin } from "lucide-react";

interface SearchFormProps {
  organizacionId: string;
}

const TAMANO_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export function SearchForm({ organizacionId }: SearchFormProps) {
  const router = useRouter();
  const [sector, setSector] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tamano, setTamano] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!sector.trim() || !ubicacion.trim()) {
      setLoading(false);
      setError("Completa sector y ubicación antes de continuar.");
      return;
    }

    try {
      const res = await fetch("/api/prospecting/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizacion_id: organizacionId,
          tipo: "apollo_search",
          sector: sector.trim(),
          ubicacion: ubicacion.trim(),
          tamano: tamano || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar la búsqueda.");
        return;
      }

      router.push("/leads");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Madrid, Barcelona, España"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño de empresa (opcional)
          </label>
          <select
            value={tamano}
            onChange={(e) => setTamano(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Sin filtro de tamaño</option>
            {TAMANO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors"
        >
          <Search className="w-4 h-4" />
          {loading ? "Buscando decisores..." : "Buscar leads"}
        </button>
      </form>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-xs text-blue-700 font-medium mb-1">¿Cómo funciona?</p>
        <p className="text-xs text-blue-600">
          LeadBy analiza tu sector con IA y genera una lista de empresas y decisores
          relevantes. Los resultados aparecen en tu bandeja listos para revisión y envío.
        </p>
      </div>
    </div>
  );
}
