import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeadsClient } from "@/components/leads/LeadsClient";
import type { LeadConRelaciones } from "@/lib/types/app.types";

export const dynamic = "force-dynamic";

type MaybeArray<T> = T | T[] | null | undefined;

function normalizeOne<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function LeadsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id, rol")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  const orgId = membresia?.organizacion_id ?? null;

  const { data: leads } = orgId
    ? await supabase
        .from("leads_prospectados")
        .select(`
          id,
          organizacion_id,
          estado,
          borrador_email,
          email_aprobado,
          email_asunto,
          email_enviado_at,
          created_at,
          global_empresas ( nombre, sector ),
          global_contactos ( nombre, apellidos, cargo, email, linkedin_url )
        `)
        .eq("organizacion_id", orgId)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const leadsNormalized: LeadConRelaciones[] = (leads ?? []).map((lead) => ({
    ...lead,
    global_empresas: normalizeOne(
      lead.global_empresas as MaybeArray<LeadConRelaciones["global_empresas"]>
    ),
    global_contactos: normalizeOne(
      lead.global_contactos as MaybeArray<LeadConRelaciones["global_contactos"]>
    ),
  }));

  const countsByEstado: Record<string, number> = {};
  for (const lead of leadsNormalized) {
    countsByEstado[lead.estado] = (countsByEstado[lead.estado] ?? 0) + 1;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Leads
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Revisa y aprueba los prospectos descubiertos por el motor de
            prospección.
          </p>
        </div>
        <span className="text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-3 py-1.5 rounded-full">
          {leadsNormalized.length} total
        </span>
      </div>

      <LeadsClient
        leadsIniciales={leadsNormalized}
        organizacionId={orgId ?? ""}
        countsByEstado={countsByEstado}
      />
    </div>
  );
}
