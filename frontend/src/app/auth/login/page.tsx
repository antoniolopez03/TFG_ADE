"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
  const [magicLinkSent, setMagicLinkSent] = useState(false);
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

  async function handleMagicLink() {
    if (!email) {
      setError("Introduce tu email para recibir el enlace de acceso.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  }

  if (magicLinkSent) {
    return (
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
          <div className="absolute left-6 top-16 h-32 w-32 rounded-full border border-leadby-500/20" />
        </div>

        <div className="relative w-full max-w-md rounded-2xl border border-black/5 bg-white/80 p-8 text-center shadow-sm shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-leadby-500/30 bg-leadby-500/10">
            <svg className="h-7 w-7 text-leadby-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Revisa tu email</h2>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            Hemos enviado un enlace de acceso a <span className="font-semibold text-foreground">{email}</span>. Haz
            clic en él para entrar.
          </p>
          <p className="mt-6 text-xs text-black/60 dark:text-white/60">
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

  return (
    <div className="relative flex flex-1 items-center justify-center px-6 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
        <div className="absolute left-6 top-16 h-32 w-32 rounded-full border border-leadby-500/20" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-black/5 bg-white/80 p-8 shadow-sm shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
            <Image src="/LEADBY-Logo.png" alt="LeadBy" width={36} height={36} className="h-9 w-9" priority />
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center bg-white px-2 text-xs text-black/40 dark:bg-transparent dark:text-white/40">
            o
          </div>
        </div>

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={loading}
          className="w-full rounded-lg border border-leadby-500/40 px-4 py-2.5 text-sm font-semibold text-leadby-500 transition hover:border-leadby-500 hover:bg-leadby-50/60 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-white/5"
        >
          Acceder con Magic Link
        </button>

        <p className="mt-6 text-xs text-black/60 dark:text-white/60">
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