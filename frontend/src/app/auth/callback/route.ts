import { createClient, createServiceClient } from "@/lib/supabase/request-client";
import { NextRequest, NextResponse } from "next/server";

/**
 * Callback de Supabase Auth.
 * Maneja redirecciones despuÃ©s de:
 * - Magic Link por email
 * - OAuth (Google, GitHub, etc.)
 * - ConfirmaciÃ³n de email al registro
 *
 * Supabase redirige aquÃ­ con un `code` en la query string.
 * Se intercambia por una sesiÃ³n real y, si es el primer acceso,
 * se crea automÃ¡ticamente la organizaciÃ³n y la membresÃ­a del usuario.
 */

function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

async function generateUniqueSlug(
  serviceClient: ReturnType<typeof createServiceClient>,
  nombreEmpresa: string
): Promise<string> {
  const base = generateSlug(nombreEmpresa) || "org";
  let slug = base;
  let attempt = 0;

  while (attempt <= 100) {
    const { data } = await serviceClient
      .from("organizaciones")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    attempt++;
    slug = attempt > 99 ? `${base}-${Date.now()}` : `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("next") ?? "/dashboard";

  // Validar que redirectTo sea una ruta relativa (prevenir open redirect)
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error`);
  }

  const supabase = createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/error`);
  }

  // Obtener el usuario reciÃ©n autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/auth/error`);
  }

  // Comprobar si el usuario ya tiene membresÃ­a (re-login magic link, OAuth, etc.)
  const { data: existingMembership } = await supabase
    .from("miembros_equipo")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingMembership) {
    // Primera vez (confirmaciÃ³n de email): crear organizaciÃ³n, membresÃ­a y configuraciÃ³n
    const meta = user.user_metadata ?? {};
    const nombreEmpresa: string = meta.nombre_empresa || "Mi OrganizaciÃ³n";
    const nombreCompleto: string = meta.nombre_completo || "";
    const cargo: string = meta.cargo || "";
    const plan: string = meta.plan_seleccionado || "free";

    try {
      const serviceClient = createServiceClient();
      const slug = await generateUniqueSlug(serviceClient, nombreEmpresa);

      // 1. Crear organizaciÃ³n
      const { data: org, error: orgError } = await serviceClient
        .from("organizaciones")
        .insert({
          nombre: nombreEmpresa,
          slug,
          plan,
          activa: true,
        })
        .select("id")
        .single();

      if (orgError || !org) throw orgError ?? new Error("No se pudo crear la organizaciÃ³n");

      // 2. Crear membresÃ­a como administrador
      const { error: memberError } = await serviceClient
        .from("miembros_equipo")
        .insert({
          organizacion_id: org.id,
          user_id: user.id,
          nombre_completo: nombreCompleto,
          cargo,
          rol: "admin",
          activo: true,
        });

      if (memberError) throw memberError;

      // 3. Crear configuraciÃ³n del tenant con valores por defecto
      const { error: configError } = await serviceClient
        .from("configuracion_tenant")
        .insert({
          organizacion_id: org.id,
          crm_proveedor: "none",
          preferencias_ia: {},
        });

      if (configError) throw configError;
    } catch (err) {
      // El usuario estÃ¡ autenticado aunque la org no se haya creado.
      // El layout SaaS detectarÃ¡ la falta de membresÃ­a y mostrarÃ¡ sin-acceso.
      console.error("[auth/callback] Error al crear organizaciÃ³n para usuario", user.id, err);
    }
  }

  // SesiÃ³n creada correctamente: redirigir al destino
  return NextResponse.redirect(`${origin}${safeRedirect}`);
}

