"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";

const SECTORES = [
  "Metalurgia",
  "Maquinaria Industrial",
  "Fabricación CNC",
  "Logística",
  "Construcción",
  "Alimentación",
  "Tecnología B2B",
  "Distribución Industrial",
  "Otros",
];

const TAMAÑOS = [
  { label: "1-10 empleados", value: "1-10" },
  { label: "11-50 empleados", value: "11-50" },
  { label: "51-200 empleados", value: "51-200" },
  { label: "201-500 empleados", value: "201-500" },
  { label: "+500 empleados", value: "500+" },
];

const INPUT_CLASS =
  "border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

export function ManualSearchForm() {
  const router = useRouter();
  const [sector, setSector] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tamano, setTamano] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sector || !ubicacion || !tamano) {
      setError("Completa todos los campos antes de buscar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/prospecting/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector, ubicacion, tamano }),
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
        {/* Sector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Sector
          </label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Seleccionar sector...</option>
            {SECTORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Ubicación
          </label>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Madrid, 28001, España..."
            className={INPUT_CLASS}
          />
        </div>

        {/* Tamaño */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Tamaño de empresa
          </label>
          <select
            value={tamano}
            onChange={(e) => setTamano(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Seleccionar tamaño...</option>
            {TAMAÑOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-leadby-500 hover:bg-leadby-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Buscando leads...
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
