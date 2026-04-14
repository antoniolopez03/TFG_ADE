import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/request-client";
import { SaaSLayout } from "@/components/layout/SaaSLayout";

export default async function SaaSRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  // 1. Auth check â€” valida JWT contra Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 2. Verificar que el usuario tiene membresÃ­a activa en una organizaciÃ³n activa
  const { data: membresia } = await supabase
    .from("miembros_equipo")
    .select("activo, organizaciones(id, activa)")
    .eq("user_id", user.id)
    .eq("activo", true)
    .maybeSingle();

  if (!membresia) {
    redirect("/auth/sin-acceso?razon=sin_organizacion");
  }

  const org = Array.isArray(membresia.organizaciones)
    ? membresia.organizaciones[0]
    : membresia.organizaciones;

  if (!org || (org as { activa: boolean }).activa === false) {
    redirect("/auth/sin-acceso?razon=cuenta_inactiva");
  }

  return <SaaSLayout>{children}</SaaSLayout>;
}

