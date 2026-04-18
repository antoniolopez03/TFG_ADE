"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Suspense, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Magnetic } from "@/lib/animations/magnetic";

// ─── Inner component (needs Suspense for useSearchParams) ─────────────────────

function LoginPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirectTo") ?? "/dashboard";
  const formRef      = useRef<HTMLDivElement>(null);

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const supabase = createClient();

  // ── GSAP entry timeline ────────────────────────────────────────────────────
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /*
       * Full motion: staggered timeline.
       * Best practice (gsap-timeline): pass defaults into the timeline
       * constructor so child tweens inherit ease + duration.
       * Best practice (gsap-performance): animate only y + opacity (autoAlpha)
       * — compositor-only, no layout cost.
       */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(
          [".auth-logo", ".auth-heading", ".auth-field", ".auth-submit", ".auth-links"],
          { autoAlpha: 0, y: 14 }
        );

        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.48 },
          delay: 0.25,
        });

        tl
          .to(".auth-logo",    { autoAlpha: 1, y: 0 })
          .to(".auth-heading", { autoAlpha: 1, y: 0 }, "-=0.28")
          .to(".auth-field",   { autoAlpha: 1, y: 0, stagger: 0.09 }, "-=0.2")
          .to(".auth-submit",  { autoAlpha: 1, y: 0, ease: "back.out(1.5)", duration: 0.4 }, "-=0.1")
          .to(".auth-links",   { autoAlpha: 1, y: 0, duration: 0.35 }, "-=0.1");
      });

      // Reduced motion: show everything instantly
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [".auth-logo", ".auth-heading", ".auth-field", ".auth-submit", ".auth-links"],
          { autoAlpha: 1, clearProps: "transform" }
        );
      });
    },
    { scope: formRef }
  );

  // ── Auth handler ───────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
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
    <div className="grid h-screen overflow-hidden md:grid-cols-[45fr_55fr]">
      {/* ── Left: branding panel (hidden on mobile) ──────────────────── */}
      <AuthPanel variant="login" />

      {/* ── Right: form ──────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center overflow-y-auto bg-background px-6 py-6 md:px-10 lg:px-16">
        <div ref={formRef} className="w-full max-w-sm">

          {/* Mobile-only logo */}
          <div className="auth-logo mb-5 flex justify-center md:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/LEADBY-Logo.png" alt="LeadBy" width={36} height={36} className="h-9 w-9" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">LeadBy</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="auth-heading mb-5">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              Acceso a la plataforma
            </h1>
            <p className="mt-1.5 text-sm text-black/60 dark:text-white/60">
              Introduce tus credenciales corporativas para gestionar tu operativa de ventas.
            </p>
          </div>

          {/* Error — framer-motion AnimatePresence slide-down + fade */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="login-error"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={  { opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} noValidate className="space-y-4">

            {/* Email */}
            <div className="auth-field">
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-black/80 dark:text-white/80"
              >
                Correo electrónico profesional
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 text-sm transition-all placeholder:text-black/30 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:border-white/10 dark:text-white dark:placeholder:text-white/25"
                placeholder="nombre@empresa.com"
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-black/80 dark:text-white/80"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 pr-11 text-sm transition-all placeholder:text-black/30 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:border-white/10 dark:text-white dark:placeholder:text-white/25"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 transition-colors hover:text-leadby-500 dark:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leadby-500/40"
                >
                  <span className="sr-only">
                    {showPassword ? "Ocultar" : "Mostrar"} contraseña
                  </span>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit — Magnetic + glow-pulse + spinner */}
            <div className="auth-submit pt-1">
              <Magnetic strength={0.15}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-leadby-gradient px-4 py-3 text-sm font-semibold text-white shadow-leadby transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 animate-glow-pulse cursor-magnetic"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entrando…
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </Magnetic>
            </div>
          </form>

          {/* Footer links */}
          <div className="auth-links mt-4 space-y-2 text-center">
            <p className="text-sm text-black/60 dark:text-white/60">
              ¿No tienes cuenta?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-leadby-500 transition-colors hover:text-leadby-600"
              >
                Crear cuenta gratis
              </Link>
            </p>
            <p className="text-xs text-black/40 dark:text-white/40">
              ¿Problemas para acceder? Escribe a{" "}
              <a
                className="font-semibold text-leadby-500 hover:text-leadby-600"
                href="mailto:antonl11@ucm.es"
              >
                antonl11@ucm.es
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-black/50 dark:text-white/50">
          Cargando…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
