import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Users, Send, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Obtener organización del usuario
  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id, rol, organizaciones(nombre, plan)")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  // Métricas rápidas desde Supabase
  const orgId = membresia?.organizacion_id;
  const [{ count: totalLeads }, { count: leadsEnviados }, { count: leadsPendientes }] =
    await Promise.all([
      supabase.from("leads_prospectados").select("*", { count: "exact", head: true }).eq("organizacion_id", orgId ?? ""),
      supabase.from("leads_prospectados").select("*", { count: "exact", head: true }).eq("organizacion_id", orgId ?? "").eq("estado", "enviado"),
      supabase.from("leads_prospectados").select("*", { count: "exact", head: true }).eq("organizacion_id", orgId ?? "").eq("estado", "pendiente_aprobacion"),
    ]);

  const orgRaw = membresia?.organizaciones;
  const org = (Array.isArray(orgRaw) ? orgRaw[0] : orgRaw) as { nombre: string; plan: string } | null;

  const METRICAS = [
    {
      label: "Total leads",
      valor: totalLeads ?? 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Correos enviados",
      valor: leadsEnviados ?? 0,
      icon: Send,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/40",
    },
    {
      label: "Pendientes de aprobación",
      valor: leadsPendientes ?? 0,
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bienvenido de nuevo{org ? `, ${org.nombre}` : ""}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Plan: <span className="capitalize font-medium">{org?.plan ?? "Free"}</span>
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {METRICAS.map(({ label, valor, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{valor}</p>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/prospecting"
            className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Nueva búsqueda</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Encuentra nuevos leads B2B</p>
            </div>
          </Link>

          <Link
            href="/leads?tab=pendientes"
            className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/50 rounded-lg flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
              <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Revisar borradores</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {leadsPendientes ?? 0} correos esperando tu aprobación
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
