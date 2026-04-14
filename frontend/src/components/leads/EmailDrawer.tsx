"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Loader2, Send } from "lucide-react";
import type { LeadConRelaciones } from "@/lib/types/app.types";

interface EmailDrawerProps {
  lead: LeadConRelaciones | null;
  onClose: () => void;
  onSent: (leadId: string) => void;
}

export function EmailDrawer({ lead, onClose, onSent }: EmailDrawerProps) {
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (lead) {
      setAsunto(lead.email_asunto ?? "");
      setCuerpo(lead.borrador_email ?? "");
      setError(null);
    }
  }, [lead]);

  if (!lead) return null;

  const empresa = lead.global_empresas;
  const contacto = lead.global_contactos;
  const contactoNombre = [contacto?.nombre, contacto?.apellidos]
    .filter(Boolean)
    .join(" ");

  async function handleSend() {
    if (!asunto.trim() || !cuerpo.trim()) {
      setError("El asunto y el cuerpo del correo son obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/webhooks/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead!.id,
          organizacion_id: lead!.organizacion_id,
          email_aprobado: cuerpo.trim(),
          email_asunto: asunto.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al enviar el correo. Inténtalo de nuevo.");
        return;
      }

      setToast(true);
      setTimeout(() => setToast(false), 3000);
      onSent(lead!.id);
      onClose();
    } catch {
      setError("Error de conexión. Comprueba tu red e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
          <Send className="w-4 h-4" />
          ¡Correo enviado y registrado en HubSpot!
        </div>
      )}

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-[560px] z-50 bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-base truncate">
              {empresa?.nombre ?? "Empresa desconocida"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {contactoNombre || "Sin contacto"}
                {contacto?.cargo ? ` · ${contacto.cargo}` : ""}
              </p>
              {contacto?.linkedin_url && (
                <a
                  href={contacto.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-leadby-400 hover:text-leadby-500 flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Asunto del correo
            </label>
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Asunto del email..."
            />
          </div>

          {/* Cuerpo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cuerpo del correo (generado por IA)
              </label>
              <span className="text-xs font-medium bg-leadby-500/10 text-leadby-600 border border-leadby-500/20 px-2 py-0.5 rounded-full">
                Editable
              </span>
            </div>
            <textarea
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              rows={12}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 w-full resize-none font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="El borrador generado por IA aparecerá aquí..."
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-right">
              {cuerpo.length} caracteres
            </p>
          </div>

          {/* Nota informativa */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/50 rounded-lg px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
            💡 Este correo será enviado desde tu dominio verificado y registrado
            automáticamente en HubSpot.
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/50 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex-1 bg-leadby-500 hover:bg-leadby-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Confirmar y Enviar a CRM
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
