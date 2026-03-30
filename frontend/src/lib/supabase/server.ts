import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para Server Components, Route Handlers y Server Actions.
 * Debe llamarse como función (no singleton) porque las cookies son request-scoped.
 *
 * IMPORTANTE: Usar getUser() en vez de getSession() para validar el JWT
 * contra los servidores de Supabase (previene ataques de replay de JWT).
 */
export function createClient() {
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

/**
 * Cliente con Service Role Key - SOLO para API Routes del servidor.
 * Bypasa todas las políticas RLS. Usar con extremo cuidado.
 * Verificar siempre la sesión del usuario ANTES de usarlo.
 */
export function createServiceClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
          } catch {}
        },
      },
    }
  );
}
