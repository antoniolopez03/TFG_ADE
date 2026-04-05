"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Loader2, CheckCircle, Database, Brain, Zap } from "lucide-react";

const FASES = [
  { icon: Database, label: "Consultando HubSpot..." },
  { icon: Brain, label: "Gemini infiriendo tu ICP..." },
  { icon: Zap, label: "Lanzando scraping automático..." },
];

export function LookalikeTrigger() {
  const [fase, setFase] = useState<number>(-1); // -1 = idle
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fase < 0 || done) return;

    if (fase >= FASES.length) {
      setDone(true);
      return;
    }

    const timer = setTimeout(() => {
      setFase((f) => f + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [fase, done]);

  async function handleClick() {
    if (fase >= 0) return;

    setFase(0);
    setError(null);
    setDone(false);

    try {
      const res = await fetch("/api/prospecting/lookalike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al iniciar el análisis.");
        setFase(-1);
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setFase(-1);
    }
  }

  const isRunning = fase >= 0 && !done;

  return (
    <div className="bg-leadby-500/5 border border-leadby-500/20 rounded-xl p-6 flex flex-col gap-5 h-full">
      {/* Icono + título */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-leadby-500/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-leadby-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Prospección Inteligente con IA
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            LeadBy analiza tus últimos cierres en HubSpot, identifica tu Perfil
            de Cliente Ideal con Gemini, y lanza automáticamente una búsqueda
            de empresas similares.
          </p>
        </div>
      </div>

      {/* Pasos */}
      <div className="space-y-2">
        {FASES.map((f, i) => {
          const Icon = f.icon;
          const active = fase === i;
          const completed = done || fase > i;
          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 text-xs transition-colors ${
                completed
                  ? "text-green-600 dark:text-green-400"
                  : active
                  ? "text-leadby-500 font-medium"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {completed ? (
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              ) : active ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
              ) : (
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>
                {i + 1}. {f.label.replace("...", completed ? " ✓" : "...")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Barra de progreso */}
      {isRunning && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-leadby-500 h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${((fase + 1) / FASES.length) * 100}%` }}
          />
        </div>
      )}

      {/* Éxito */}
      {done && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800/50 rounded-lg px-4 py-3 text-xs text-green-700 dark:text-green-400 flex items-center justify-between">
          <span>¡Análisis completado! Los leads aparecerán en tu bandeja.</span>
          <Link
            href="/leads"
            className="text-green-700 dark:text-green-400 font-medium hover:underline ml-2 flex-shrink-0"
          >
            Ver leads →
          </Link>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Botón */}
      {!done && (
        <button
          onClick={handleClick}
          disabled={isRunning}
          className="bg-leadby-gradient text-white shadow-leadby rounded-xl py-3 w-full font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-auto"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Buscar clientes similares con IA
            </>
          )}
        </button>
      )}
    </div>
  );
}
