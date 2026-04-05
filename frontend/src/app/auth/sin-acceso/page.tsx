"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MENSAJES: Record<string, { titulo: string; cuerpo: string }> = {
  sin_organizacion: {
    titulo: "Sin acceso a la plataforma",
    cuerpo:
      "Tu cuenta no está vinculada a ninguna organización activa. Contacta con tu administrador o regístrate de nuevo.",
  },
  cuenta_inactiva: {
    titulo: "Cuenta suspendida",
    cuerpo:
      "La organización a la que perteneces se encuentra suspendida. Contacta con soporte para reactivarla.",
  },
};

const FALLBACK = {
  titulo: "Acceso denegado",
  cuerpo: "No tienes permiso para acceder a esta sección.",
};

function SinAccesoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const razon = searchParams.get("razon") ?? "";
  const msg = MENSAJES[razon] ?? FALLBACK;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="relative flex flex-1 items-center justify-center px-6 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-black/5 bg-white/80 p-8 text-center shadow-sm shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
          <Image src="/LEADBY-Logo.png" alt="LeadBy" width={48} height={48} className="h-12 w-12" priority />
        </div>

        {/* Warning icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-leadby-500/30 bg-leadby-500/10">
          <svg className="h-7 w-7 text-leadby-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">{msg.titulo}</h2>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">{msg.cuerpo}</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="w-full rounded-lg bg-leadby-500 px-4 py-2.5 text-sm font-semibold text-white shadow-leadby-sm transition hover:bg-leadby-600"
          >
            Volver al inicio de sesión
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-black/70 transition hover:border-leadby-500/40 hover:text-leadby-500 dark:border-white/10 dark:text-white/70"
          >
            Cerrar sesión
          </button>
        </div>

        <p className="mt-6 text-xs text-black/60 dark:text-white/60">
          ¿Necesitas ayuda? Escribe a{" "}
          <a className="font-semibold text-leadby-500 hover:text-leadby-600" href="mailto:soporte@leadby.edu">
            soporte@leadby.edu
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default function SinAccesoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-black/50 dark:text-white/50">
          Cargando...
        </div>
      }
    >
      <SinAccesoContent />
    </Suspense>
  );
}
