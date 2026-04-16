import { createClient } from "@/lib/supabase/request-client";
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
          global_empresas ( nombre, sector, dominio, ciudad, provincia, pais, telefono, linkedin_url, empleados_rango, ingresos_rango, tecnologias ),
          global_contactos ( nombre, apellidos, cargo, email, telefono, linkedin_url, apollo_contact_id, email_status, seniority, departamento )
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

  return (
    <LeadsClient
      leadsIniciales={leadsNormalized}
      organizacionId={orgId ?? ""}
    />
  );
}
