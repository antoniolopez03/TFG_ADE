import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings, Key, Brain, Users } from "lucide-react";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id, rol, organizaciones(nombre, plan)")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (!membresia) redirect("/auth/login");

  const { data: config } = await supabase
    .from("configuracion_tenant")
    .select("crm_proveedor, preferencias_ia, scraper_config")
    .eq("organizacion_id", membresia.organizacion_id)
    .single();

  const orgRaw = membresia.organizaciones;
  const org = (Array.isArray(orgRaw) ? orgRaw[0] : orgRaw) as { nombre: string; plan: string } | null;
  const esAdmin = membresia.rol === "admin";

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1 text-sm">{org?.nombre}</p>
      </div>

      <div className="space-y-4">
        {/* Info de organización */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Organización</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nombre</span>
              <span className="font-medium text-gray-900">{org?.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium text-gray-900 capitalize">{org?.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tu rol</span>
              <span className="font-medium text-gray-900 capitalize">{membresia.rol}</span>
            </div>
          </div>
        </div>

        {/* CRM */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Integración CRM</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Proveedor</span>
              <span className="font-medium text-gray-900 capitalize">
                {config?.crm_proveedor ?? "No configurado"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Token API (HubSpot)</span>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded font-mono">
                ••••••••••••{esAdmin ? " (configurar)" : ""}
              </span>
            </div>
          </div>
          {esAdmin && (
            <p className="mt-4 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
              Para configurar el token de HubSpot, contacta con el equipo técnico durante el onboarding.
              El token se almacena cifrado en Supabase Vault.
            </p>
          )}
        </div>

        {/* Preferencias de IA */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Preferencias de IA</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tono de voz</span>
              <span className="font-medium text-gray-900 capitalize">
                {(config?.preferencias_ia as { tono_voz?: string } | null)?.tono_voz ?? "Formal"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Propuesta de valor</span>
              <span className="font-medium text-gray-900 text-xs max-w-xs text-right">
                {(config?.preferencias_ia as { propuesta_valor?: string } | null)?.propuesta_valor ?? "No configurada"}
              </span>
            </div>
          </div>
          {esAdmin && (
            <p className="mt-4 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
              El tono de voz y la propuesta de valor se usan para personalizar todos los correos generados por Gemini.
              Configúralos durante el onboarding.
            </p>
          )}
        </div>

        {/* Miembros del equipo */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Tu cuenta</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ID de usuario</span>
              <span className="font-mono text-xs text-gray-400">{user.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
