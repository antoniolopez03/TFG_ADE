import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function createClient_() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // En Server Components de solo lectura, set() no está disponible.
            // El middleware se encarga de refrescar las cookies de sesión.
          }
        },
      },
    }
  );
}

export { createClient_ as createClient };

/**
 * Cliente con Service Role Key - SOLO para API Routes del servidor.
 * Bypasa todas las políticas RLS. Usar con extremo cuidado.
 * Verificar siempre la sesión del usuario ANTES de usarlo.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}