import { createClient } from "@/lib/supabase/request-client";
import { redirect } from "next/navigation";
import { LeadsClient } from "@/components/leads/LeadsClient";
import type { LeadConRelaciones } from "@/lib/types/app.types";

export const dynamic = "force-dynamic";

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
        .from("leads")
        .select(`
          id,
          organizacion_id,
          estado,
          fuente,
          email_borrador,
          email_aprobado,
          email_asunto,
          email_enviado_at,
          asignado_a,
          notas,
          created_at,
          empresa_nombre,
          empresa_dominio,
          empresa_sector,
          empresa_empleados_rango,
          empresa_facturacion_rango,
          empresa_ciudad,
          empresa_pais,
          empresa_telefono,
          empresa_linkedin_url,
          empresa_descripcion,
          contacto_nombre_completo,
          contacto_cargo,
          contacto_departamento,
          contacto_email,
          contacto_telefono,
          contacto_linkedin_url
        `)
        .eq("organizacion_id", orgId)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const leadsNormalized: LeadConRelaciones[] = (leads ?? []) as LeadConRelaciones[];

  return (
    <LeadsClient
      leadsIniciales={leadsNormalized}
      organizacionId={orgId ?? ""}
    />
  );
}
