"use client";

import { useState } from "react";
import { Loader2, Check, X, Eye, EyeOff } from "lucide-react";

const INPUT_CLASS =
  "border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leadby-500/30 focus:border-leadby-500 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

interface CrmIntegrationFormProps {
  organizacionId: string;
  crmProveedor: string | null;
  hasToken: boolean;
  isAdmin: boolean;
}

export function CrmIntegrationForm({
  organizacionId,
  crmProveedor: _crmProveedor,
  hasToken,
  isAdmin,
}: CrmIntegrationFormProps) {
  const [showTokenInput, setShowTokenInput] = useState(!hasToken);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  async function handleSaveToken(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      setTokenError("El token no puede estar vacío.");
      return;
    }

    setSavingToken(true);
    setTokenError(null);

    let responseOk = false;
    let errorMessage = "Error al guardar el token. Inténtalo de nuevo.";

    try {
      const res = await fetch("/api/crm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizacion_id: organizacionId,
          token: token.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      responseOk = res.ok && data?.ok === true;
      if (!responseOk) {
        errorMessage = data?.error ?? data?.message ?? errorMessage;
      }
    } catch {
      errorMessage = "Error de conexión al guardar el token.";
    }

    setSavingToken(false);

    if (!responseOk) {
      setTokenError(errorMessage);
    } else {
      setTokenSaved(true);
      setShowTokenInput(false);
      setToken("");
      setTimeout(() => setTokenSaved(false), 2500);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/crm/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setVerifyResult({ ok: data.ok, message: data.message ?? data.error });
    } catch {
      setVerifyResult({ ok: false, message: "Error de conexión." });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Proveedor CRM */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Proveedor CRM
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={true}
              readOnly
              className="accent-leadby-500"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">HubSpot</span>
          </label>
          <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
            <input type="radio" disabled className="accent-leadby-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Salesforce</span>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
              Próximamente
            </span>
          </label>
        </div>
      </div>

      {/* Token API */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Token API (HubSpot)
          </label>
          {isAdmin && hasToken && !showTokenInput && (
            <button
              onClick={() => setShowTokenInput(true)}
              className="text-xs text-leadby-500 hover:text-leadby-600 font-medium"
            >
              Actualizar token
            </button>
          )}
        </div>

        {!showTokenInput ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg flex-1">
              ••••••••••••••••••••
            </span>
            {tokenSaved && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Check className="w-3.5 h-3.5" />
                Guardado
              </span>
            )}
          </div>
        ) : isAdmin ? (
          <form onSubmit={handleSaveToken} className="space-y-3">
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className={`${INPUT_CLASS} pr-10 font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {tokenError && (
              <p className="text-xs text-red-600 dark:text-red-400">{tokenError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingToken}
                className="bg-leadby-500 hover:bg-leadby-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-xs flex items-center gap-1.5 disabled:opacity-60"
              >
                {savingToken ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                Guardar token
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTokenInput(false);
                  setToken("");
                  setTokenError(null);
                }}
                className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors text-xs"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {/* Verificar conexión */}
      {isAdmin && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar conexión"
            )}
          </button>

          {verifyResult && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${
                verifyResult.ok
                  ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
              }`}
            >
              {verifyResult.ok ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              {verifyResult.message}
            </span>
          )}
        </div>
      )}

      {/* Banner DNS */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
          Configuración DNS requerida
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          Para garantizar la entrega de tus correos, configura estos registros
          DNS antes de tu primer envío. Añade los registros DKIM y SPF
          proporcionados por tu proveedor de email a tu dominio. Contacta con
          el equipo técnico durante el onboarding para obtener los valores
          exactos.
        </p>
      </div>
    </div>
  );
}
