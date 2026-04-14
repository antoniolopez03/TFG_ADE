import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Cliente Supabase request-scoped para Server Components y Route Handlers.
 * Mantiene sesiÃ³n del usuario usando cookies de Next.js.
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
            // En contextos de solo lectura no siempre estÃ¡ disponible set().
          }
        },
      },
    }
  );
}

export { createServiceClient };

