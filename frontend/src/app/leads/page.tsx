import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeadsTable } from "@/components/leads/LeadsTable";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (!membresia) redirect("/auth/login");

  const estadoFiltro = searchParams.estado;

  // Fetch inicial de leads (server-side para SEO y primera carga rápida)
  let query = supabase
    .from("leads_prospectados")
    .select(`
      id,
      estado,
      email_borrador,
      email_enviado_at,
      created_at,
      asignado_a,
      global_empresas (nombre, dominio, ciudad, sector),
      global_contactos (nombre, apellidos, cargo, email, linkedin_url)
    `)
    .eq("organizacion_id", membresia.organizacion_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (estadoFiltro) {
    query = query.eq("estado", estadoFiltro);
  }

  const { data: leads } = await query;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bandeja de Leads</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Revisa y aprueba los leads descubiertos por el motor de prospección.
          </p>
        </div>
      </div>

      <LeadsTable
        leadsIniciales={leads ?? []}
        organizacionId={membresia.organizacion_id}
        estadoInicial={estadoFiltro}
      />
    </div>
  );
}
