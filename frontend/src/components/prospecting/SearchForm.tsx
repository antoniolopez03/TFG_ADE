"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, UserRound, MapPin, BadgeCheck } from "lucide-react";

interface SearchFormProps {
  organizacionId: string;
}

const SENIORITY_OPTIONS = ["senior", "manager", "director", "vp", "c_suite"] as const;

export function SearchForm({ organizacionId }: SearchFormProps) {
  const router = useRouter();
  const [titlesInput, setTitlesInput] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [seniorities, setSeniorities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSeniority(option: string) {
    setSeniorities((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const titles = titlesInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (titles.length === 0 || !sector.trim() || !location.trim()) {
      setLoading(false);
      setError("Completa cargo objetivo, sector y ubicación antes de continuar.");
      return;
    }

    try {
      const res = await fetch("/api/prospecting/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizacion_id: organizacionId,
          tipo: "apollo_search",
          titles,
          sector: sector.trim(),
          location: location.trim(),
          seniorities,
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo objetivo</label>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              value={titlesInput}
              onChange={(e) => setTitlesInput(e.target.value)}
              placeholder="Ej: Director de Compras, CEO, Responsable de Producción"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500">Puedes escribir varios cargos separados por coma.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Madrid, Barcelona, España"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Seniority (opcional)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SENIORITY_OPTIONS.map((option) => {
              const selected = seniorities.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleSeniority(option)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    selected
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
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
          LeadBy busca directamente a los decisores en la base de datos de Apollo.io. Los
          resultados aparecen en tu bandeja de leads listos para revisión.
        </p>
      </div>
    </div>
  );
}
