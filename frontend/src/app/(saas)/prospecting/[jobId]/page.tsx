"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

type JobEstado = "pendiente" | "ejecutando" | "completado" | "error";

interface Job {
  id: string;
  estado: JobEstado;
  tipo: string;
  parametros: Record<string, unknown>;
  total_resultados: number;
  procesados?: number;
  error_mensaje: string | null;
  created_at: string;
  completado_at?: string | null;
}

export default function JobStatusPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Carga inicial
    async function loadJob() {
      const { data } = await supabase
        .from("trabajos_busqueda")
        .select("*")
        .eq("id", jobId)
        .single();

      setJob(data);
      setLoading(false);
    }

    loadJob();

    // Suscripción a Realtime para actualizaciones en tiempo real
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trabajos_busqueda",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          setJob(payload.new as Job);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, supabase]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Job no encontrado.</p>
        <Link href="/prospecting" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          ← Volver a prospección
        </Link>
      </div>
    );
  }

  const procesados = job.procesados ?? job.total_resultados;
  const progreso =
    job.total_resultados > 0
      ? Math.round((procesados / job.total_resultados) * 100)
      : job.estado === "ejecutando"
      ? 30
      : job.estado === "completado"
      ? 100
      : 0;

  const ESTADO_CONFIG = {
    pendiente: {
      icon: <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />,
      texto: "Iniciando motor de búsqueda...",
      subtexto: "El motor puede tardar hasta 20 segundos en arrancar.",
      color: "text-gray-600",
    },
    ejecutando: {
      icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
      texto: "Buscando empresas...",
      subtexto: "Navegando automáticamente. Por favor, espera.",
      color: "text-blue-600",
    },
    completado: {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      texto: "¡Búsqueda completada!",
      subtexto: `Se encontraron ${job.total_resultados} empresas.`,
      color: "text-green-600",
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      texto: "Error en la búsqueda",
      subtexto: job.error_mensaje ?? "Inténtalo de nuevo.",
      color: "text-red-600",
    },
  };

  const config = ESTADO_CONFIG[job.estado];

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href="/prospecting" className="text-sm text-gray-500 hover:text-gray-700">
          ← Nueva búsqueda
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          {config.icon}
          <div>
            <p className={`font-semibold text-sm ${config.color}`}>{config.texto}</p>
            <p className="text-xs text-gray-400 mt-0.5">{config.subtexto}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Progreso</span>
            <span>{progreso}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Detalles */}
        <div className="text-xs text-gray-500 space-y-1 mb-6">
          <p>
            Tipo: <span className="font-medium capitalize">{job.tipo.replace("_", " ")}</span>
          </p>
          {job.tipo === "apollo_search" && (
            <p>
              Búsqueda:{" "}
              <span className="font-medium">
                {String(job.parametros.query)} en {String(job.parametros.location)}
              </span>
            </p>
          )}
          {job.tipo === "apollo_lookalike" && (
            <p className="font-mono text-xs break-all">
              Modo lookalike con parámetros: {JSON.stringify(job.parametros).slice(0, 80)}...
            </p>
          )}
        </div>

        {/* CTA cuando termina */}
        {job.estado === "completado" && (
          <Link
            href="/leads?tab=pendientes"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Ver leads encontrados
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        {job.estado === "error" && (
          <Link
            href="/prospecting"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors"
          >
            Intentar de nuevo
          </Link>
        )}
      </div>
    </div>
  );
}
