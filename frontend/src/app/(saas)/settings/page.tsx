import { createClient } from "@/lib/supabase/request-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { AlertTriangle } from "lucide-react";
import { SettingsTabs }           from "@/components/settings/SettingsTabs";
import type { SettingsTab }       from "@/components/settings/SettingsTabs";
import { OrgForm }                from "@/components/settings/OrgForm";
import { CrmIntegrationForm }     from "@/components/settings/CrmIntegrationForm";
import { AiToneForm }             from "@/components/settings/AiToneForm";
import { TeamManager }            from "@/components/settings/TeamManager";
import { SettingsAnimatedLayout } from "@/components/settings/SettingsAnimatedLayout";

type MaybeArray<T> = T | T[] | null | undefined;
function normalizeOne<T>(v: MaybeArray<T>): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

const VALID_TABS: SettingsTab[] = ["organizacion", "crm", "ia", "equipo"];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id, rol, organizaciones(nombre, plan)")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  const esAdmin = membresia?.rol === "admin";
  const orgRaw  = normalizeOne(membresia?.organizaciones ?? null);
  const org     = orgRaw as { nombre: string; plan: string } | null;

  const tab = (
    VALID_TABS.includes(searchParams.tab as SettingsTab)
      ? searchParams.tab
      : "organizacion"
  ) as SettingsTab;

  // ── No organisation membership ──────────────────────────────────────────────
  if (!membresia) {
    return (
      <SettingsAnimatedLayout>
        <div className="p-8 max-w-3xl">
          <div className="settings-reveal mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuración
            </h1>
          </div>
          <div className="settings-reveal bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Sin organización activa
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tu cuenta no está asociada a ninguna organización activa. Contacta
              con un administrador para que te invite al equipo.
            </p>
          </div>
        </div>
      </SettingsAnimatedLayout>
    );
  }

  // ── Fetch additional data in parallel ───────────────────────────────────────
  const [configResult, equipoResult] = await Promise.all([
    supabase
      .from("configuracion_tenant")
      .select("crm_proveedor, hubspot_token_vault_id, preferencias_ia")
      .eq("organizacion_id", membresia.organizacion_id)
      .single(),
    supabase
      .from("miembros_equipo")
      .select(
        "id, user_id, nombre_completo, cargo, rol, activo, invited_at, joined_at, created_at"
      )
      .eq("organizacion_id", membresia.organizacion_id)
      .order("created_at", { ascending: true }),
  ]);

  const config    = configResult.data;
  const equipo    = equipoResult.data ?? [];

  const preferenciasIa = config?.preferencias_ia as
    | { tono_voz?: string; idioma?: string }
    | null
    | undefined;

  return (
    <SettingsAnimatedLayout>
      <div className="p-8 max-w-3xl">

        {/* ── Header ── */}
        <div className="settings-reveal mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuración
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {org?.nombre}
            </p>
          </div>
        </div>

        {/* ── Non-admin read-only banner ── */}
        {!esAdmin && (
          <div className="settings-reveal mb-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Solo los administradores pueden modificar la configuración. Estás
              viendo los datos en modo lectura.
            </p>
          </div>
        )}

        {/* ── Tabs (contains its own settings-reveal class) ── */}
        <SettingsTabs activeTab={tab} />

        {/* ── Tab content card ── */}
        <div className="settings-reveal bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 transition-colors hover:border-gray-200 dark:hover:border-gray-700">

          {tab === "organizacion" && (
            <>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-5">
                Información de la organización
              </h2>
              <OrgForm
                organizacionId={membresia.organizacion_id}
                nombre={org?.nombre ?? ""}
                plan={org?.plan ?? "free"}
                isAdmin={esAdmin}
              />
            </>
          )}

          {tab === "crm" && (
            <>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-5">
                Integración CRM
              </h2>
              <CrmIntegrationForm
                organizacionId={membresia.organizacion_id}
                crmProveedor={config?.crm_proveedor ?? null}
                hasToken={!!config?.hubspot_token_vault_id}
                isAdmin={esAdmin}
              />
            </>
          )}

          {tab === "ia" && (
            <>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-5">
                Preferencias de IA
              </h2>
              <AiToneForm
                organizacionId={membresia.organizacion_id}
                tonoVoz={preferenciasIa?.tono_voz ?? ""}
                idioma={preferenciasIa?.idioma ?? "es"}
                isAdmin={esAdmin}
              />
            </>
          )}

          {tab === "equipo" && (
            <>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-5">
                Gestión del equipo
              </h2>
              <TeamManager
                organizacionId={membresia.organizacion_id}
                miembros={equipo}
                isAdmin={esAdmin}
              />
            </>
          )}
        </div>

      </div>
    </SettingsAnimatedLayout>
  );
}
