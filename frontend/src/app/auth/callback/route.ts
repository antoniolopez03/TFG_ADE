import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Callback de Supabase Auth.
 * Maneja redirecciones después de:
 * - Magic Link por email
 * - OAuth (Google, GitHub, etc.)
 * - Confirmación de email al registro
 *
 * Supabase redirige aquí con un `code` en la query string.
 * Se intercambia por una sesión real y se redirige al destino.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("next") ?? "/dashboard";

  // Validar que redirectTo sea una ruta relativa (prevenir open redirect)
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sesión creada correctamente: redirigir al destino
      return NextResponse.redirect(`${origin}${safeRedirect}`);
    }
  }

  // Error: redirigir a la página de error de auth
  return NextResponse.redirect(`${origin}/auth/error`);
}
