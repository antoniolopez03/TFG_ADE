"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Edit3,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Sparkles,
  Eye,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { buildEmailPreviewDocument, hasHtmlTags } from "@/lib/utils/email-preview";
import type { LeadEstado } from "@/lib/types/app.types";

interface EmailApprovalPanelProps {
  leadId: string;
  organizacionId: string;
  estado: LeadEstado;
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

  const [emailBorradorActual, setEmailBorradorActual] = useState(emailBorrador);
  const [contenido, setContenido] = useState(emailAprobado ?? emailBorrador ?? "");
  const [asunto, setAsunto] = useState(asuntoInicial ?? "");
  const [loading, setLoading] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadoActual, setEstadoActual] = useState(estado);
  const [enviado, setEnviado] = useState(estado === "enviado");
  const [modoVistaCuerpo, setModoVistaCuerpo] = useState<"preview" | "html">("preview");
  const [previewHeight, setPreviewHeight] = useState(360);
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);
  const borradorDisponible = emailBorradorActual ?? emailBorrador;
  const canSend = estadoActual === "pendiente_aprobacion" || estadoActual === "aprobado";
  const cuerpoTieneHtml = hasHtmlTags(contenido);

  const syncPreviewHeight = useCallback(() => {
    const frame = previewFrameRef.current;
    if (!frame) {
      return;
    }

    const doc = frame.contentDocument;
    if (!doc) {
      return;
    }

    const bodyHeight = doc.body?.scrollHeight ?? 0;
    const htmlHeight = doc.documentElement?.scrollHeight ?? 0;
    const nextHeight = Math.max(bodyHeight, htmlHeight, 220);

    setPreviewHeight((current) => (current === nextHeight ? current : nextHeight));
  }, []);

  useEffect(() => {
    setEmailBorradorActual(emailBorrador);
    setContenido(emailAprobado ?? emailBorrador ?? "");
    setAsunto(asuntoInicial ?? "");
    setEstadoActual(estado);
    setEnviado(estado === "enviado");
    setModoVistaCuerpo("preview");
  }, [emailAprobado, emailBorrador, asuntoInicial, estado]);

  useEffect(() => {
    if (modoVistaCuerpo !== "preview") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      syncPreviewHeight();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [contenido, modoVistaCuerpo, syncPreviewHeight]);

  async function handleGenerarBorrador() {
    setGeneratingDraft(true);
    setError(null);

    try {
      const res = await fetch("/api/webhooks/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          organizacion_id: organizacionId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.error ?? "No se pudo generar el borrador con IA.";
        setError(message);
        toast.error(message);
        return;
      }

      const borrador =
        typeof data.email_borrador === "string" ? data.email_borrador : "";
      const asuntoGenerado =
        typeof data.email_asunto === "string" ? data.email_asunto : "";

      if (!borrador) {
        const message = "Gemini no devolvió un borrador válido para este lead.";
        setError(message);
        toast.error(message);
        return;
      }

      setEmailBorradorActual(borrador);
      setContenido(borrador);

      if (asuntoGenerado) {
        setAsunto(asuntoGenerado);
      }

      toast.success("Borrador generado con éxito.");
      router.refresh();
    } catch {
      const message = "Error de conexión. Inténtalo de nuevo.";
      setError(message);
      toast.error(message);
    } finally {
      setGeneratingDraft(false);
    }
  }

  async function handleEnviar() {
    if (!canSend) {
      setError("Este lead no se puede enviar desde su estado actual.");
      return;
    }

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
        const message = data.error ?? "Error al enviar el email.";
        setError(message);
        toast.error(message);
        return;
      }

      setEnviado(true);
      toast.success("¡Correo enviado! El contacto se ha sincronizado con HubSpot.");
      router.refresh();
    } catch {
      const message = "Error de conexión. Inténtalo de nuevo.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // Estado: ya enviado
  if (enviado || estadoActual === "enviado") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <h2 className="font-semibold text-gray-900 text-sm">Email enviado</h2>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-wrap font-mono text-xs">
          {emailAprobado ?? borradorDisponible ?? "—"}
        </div>
      </div>
    );
  }

  // Estado: no hay borrador todavía
  if (!borradorDisponible) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-900 text-sm">Borrador de email</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500">Aún no hay borrador generado para este lead.</p>
          <p className="text-xs text-gray-400 mt-1">Puedes generarlo ahora con Gemini para continuar el flujo de aprobación.</p>

          {error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-left">
              {error}
            </p>
          )}

          <button
            onClick={handleGenerarBorrador}
            disabled={generatingDraft}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-leadby-500 hover:bg-leadby-600 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generatingDraft ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando borrador...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generar borrador con IA
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Estado: borrador disponible, esperando aprobación
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Edit3 className="w-4 h-4 text-amber-500" />
        <h2 className="font-semibold text-gray-900 text-sm">Revisar y enviar email</h2>
        <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          Pendiente
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Este borrador ha sido generado por Google Gemini basándose en el perfil de la empresa.
        Puedes editarlo antes de enviarlo. El email NO se enviará hasta que pulses &quot;Enviar borrador&quot;.
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
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-600">Cuerpo del email</label>
          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              type="button"
              onClick={() => setModoVistaCuerpo("preview")}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
                modoVistaCuerpo === "preview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Vista previa
            </button>
            <button
              type="button"
              onClick={() => setModoVistaCuerpo("html")}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
                modoVistaCuerpo === "html"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Code2 className="w-3.5 h-3.5" />
              HTML
            </button>
          </div>
        </div>

        {modoVistaCuerpo === "preview" ? (
          <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
            {contenido.trim() ? (
              <iframe
                title="Vista previa del borrador"
                sandbox=""
                srcDoc={buildEmailPreviewDocument(contenido)}
                ref={previewFrameRef}
                onLoad={syncPreviewHeight}
                className="w-full pointer-events-none"
                style={{ height: `${previewHeight}px` }}
              />
            ) : (
              <div className="h-[180px] flex items-center justify-center text-sm text-gray-500 px-4 text-center">
                El borrador está vacío. Cambia a la pestaña HTML para escribir el contenido.
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono resize-y"
          />
        )}

        <p className="mt-1 text-xs text-gray-400">
          {contenido.length} caracteres · ~{Math.round(contenido.split(/\s+/).filter(Boolean).length)} palabras
          {cuerpoTieneHtml ? " · Contenido HTML detectado" : ""}
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={handleEnviar}
          disabled={loading || !contenido.trim() || !asunto.trim() || !canSend}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 font-medium rounded-lg text-sm transition-colors",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
          {loading ? "Enviando..." : "Enviar borrador"}
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
