"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Edit3, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EmailApprovalPanelProps {
  leadId: string;
  organizacionId: string;
  estado: string;
  emailBorrador: string | null;
  emailAprobado: string | null;
  emailAsunto: string | null;
}

/**
 * Panel de aprobación de email - Interfaz del Human-in-the-Loop.
 *
 * Este componente es el núcleo del flujo de control de calidad:
 * el comercial ve el borrador generado por Gemini, puede editarlo
 * y solo puede enviarlo tras su aprobación explícita.
 */
export function EmailApprovalPanel({
  leadId,
  organizacionId,
  estado,
  emailBorrador,
  emailAprobado,
  emailAsunto: asuntoInicial,
}: EmailApprovalPanelProps) {
  const router = useRouter();

  const contenidoInicial = emailAprobado ?? emailBorrador ?? "";
  const [contenido, setContenido] = useState(contenidoInicial);
  const [asunto, setAsunto] = useState(asuntoInicial ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(estado === "enviado");

  async function handleEnviar() {
    if (!contenido.trim() || !asunto.trim()) {
      setError("El asunto y el cuerpo del email no pueden estar vacíos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/webhooks/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          organizacion_id: organizacionId,
          email_aprobado: contenido,
          email_asunto: asunto,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al enviar el email.");
        return;
      }

      setEnviado(true);
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // Estado: ya enviado
  if (enviado || estado === "enviado") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <h2 className="font-semibold text-gray-900 text-sm">Email enviado</h2>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-wrap font-mono text-xs">
          {emailAprobado ?? emailBorrador ?? "—"}
        </div>
      </div>
    );
  }

  // Estado: no hay borrador todavía
  if (!emailBorrador && estado !== "pendiente_aprobacion") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-900 text-sm">Borrador de email</h2>
        </div>
        <div className="p-8 text-center">
          {estado === "enriqueciendo" ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Gemini está redactando el email...</p>
              <p className="text-xs text-gray-400 mt-1">Actualiza la página en unos segundos.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-400">
                Enriquece este lead primero para generar el borrador con IA.
              </p>
              <button
                onClick={() => router.push("/leads")}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                Volver a la bandeja
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Estado: borrador disponible, esperando aprobación
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Edit3 className="w-4 h-4 text-amber-500" />
        <h2 className="font-semibold text-gray-900 text-sm">Revisar y aprobar email</h2>
        <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          Pendiente
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Este borrador ha sido generado por Google Gemini basándose en el perfil de la empresa.
        Puedes editarlo antes de enviarlo. El email NO se enviará hasta que pulses &quot;Confirmar y Enviar&quot;.
      </p>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Asunto */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Asunto del email
        </label>
        <input
          type="text"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Asunto generado por Gemini..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Cuerpo del email */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Cuerpo del email
        </label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono resize-y"
        />
        <p className="mt-1 text-xs text-gray-400">
          {contenido.length} caracteres · ~{Math.round(contenido.split(" ").length)} palabras
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={handleEnviar}
          disabled={loading || !contenido.trim() || !asunto.trim()}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 font-medium rounded-lg text-sm transition-colors",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
          {loading ? "Enviando..." : "Confirmar y Enviar"}
        </button>

        <button
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium rounded-lg text-sm transition-colors"
        >
          Cancelar
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400 text-center">
        Al confirmar, el email se envía via Resend y se registra en tu CRM (HubSpot).
      </p>
    </div>
  );
}
