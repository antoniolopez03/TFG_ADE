import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SearchForm } from "@/components/prospecting/SearchForm";

export default async function ProspectingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Obtener la organización del usuario para pasarla al formulario
  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("organizacion_id")
    .eq("user_id", user.id)
    .eq("activo", true)
    .single();

  if (!membresia) redirect("/auth/login");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Motor de Prospección</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Encuentra nuevas empresas B2B automáticamente. Los resultados aparecen en tu bandeja de leads.
        </p>
      </div>

      <SearchForm organizacionId={membresia.organizacion_id} />
    </div>
  );
}
