"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex flex-1 items-center justify-center px-6 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-black/5 bg-white/80 p-8 shadow-sm shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
            <Image src="/LEADBY-Logo.png" alt="LeadBy" width={48} height={48} className="h-12 w-12" priority />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">Acceso a la plataforma</h1>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            Introduce tus credenciales corporativas para gestionar tu operativa de ventas.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-black/80 dark:text-white/80">
              Correo electrónico profesional
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm text-black/90 shadow-sm transition focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="nombre@empresa.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-black/80 dark:text-white/80">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 pr-11 text-sm text-black/90 shadow-sm transition focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-black/60 transition hover:text-leadby-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leadby-500/40 dark:text-white/60"
              >
                <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-leadby-500 px-4 py-2.5 text-sm font-semibold text-white shadow-leadby-sm transition hover:bg-leadby-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-black/60 dark:text-white/60">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="font-semibold text-leadby-500 hover:text-leadby-600 transition-colors">
            Crear cuenta gratis
          </Link>
        </p>

        <p className="mt-3 text-xs text-black/60 dark:text-white/60">
          ¿Problemas para acceder? Contacta con tu consultor técnico asignado o escribe a{" "}
          <a className="font-semibold text-leadby-500 hover:text-leadby-600" href="mailto:soporte@leadby.edu">
            soporte@leadby.edu
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-sm text-black/50 dark:text-white/50">Cargando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}