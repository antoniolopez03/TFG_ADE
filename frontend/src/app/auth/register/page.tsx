"use client";

import "@/lib/gsap/register";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Magnetic } from "@/lib/animations/magnetic";

// ─── Plans ────────────────────────────────────────────────────────────────────

type Plan = "free" | "starter" | "pro";

const PLANES: { id: Plan; nombre: string; precio: string; descripcion: string }[] = [
  { id: "free",    nombre: "Free",    precio: "0 €",      descripcion: "Hasta 50 leads/mes" },
  { id: "starter", nombre: "Starter", precio: "49 €/mes", descripcion: "Hasta 500 leads/mes" },
  { id: "pro",     nombre: "Pro",     precio: "99 €/mes", descripcion: "Leads ilimitados + IA" },
];

// ─── Inner component ──────────────────────────────────────────────────────────

function RegisterPageContent() {
  const searchParams  = useSearchParams();
  const planParam     = (searchParams.get("plan") ?? "free") as Plan;
  const formRef       = useRef<HTMLDivElement>(null);

  const [nombreCompleto,    setNombreCompleto]    = useState("");
  const [cargo,             setCargo]             = useState("");
  const [nombreEmpresa,     setNombreEmpresa]     = useState("");
  const [email,             setEmail]             = useState("");
  const [password,          setPassword]          = useState("");
  const [confirmPassword,   setConfirmPassword]   = useState("");
  const [planSeleccionado,  setPlanSeleccionado]  = useState<Plan>(
    PLANES.find((p) => p.id === planParam) ? planParam : "free"
  );
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [success,             setSuccess]             = useState(false);
  const [error,               setError]               = useState<string | null>(null);

  const supabase = createClient();

  // ── GSAP entry timeline ──────────────────────────────────────────────────
  useGSAP(
    () => {
      if (success) return; // success screen has its own animation

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(
          [".auth-logo", ".auth-heading", ".auth-plan", ".auth-field", ".auth-submit", ".auth-links"],
          { autoAlpha: 0, y: 14 }
        );

        /*
         * Register has more fields than login so we reduce per-item stagger
         * to keep total duration reasonable (~0.06s each vs 0.09 for login).
         * gsap-timeline: position parameter "-=X" overlaps tweens precisely.
         */
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.45 },
          delay: 0.25,
        });

        tl
          .to(".auth-logo",    { autoAlpha: 1, y: 0 })
          .to(".auth-heading", { autoAlpha: 1, y: 0 }, "-=0.25")
          .to(".auth-plan",    { autoAlpha: 1, y: 0 }, "-=0.2")
          .to(".auth-field",   { autoAlpha: 1, y: 0, stagger: 0.06 }, "-=0.15")
          .to(".auth-submit",  { autoAlpha: 1, y: 0, ease: "back.out(1.4)", duration: 0.38 }, "-=0.1")
          .to(".auth-links",   { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.1");
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [".auth-logo", ".auth-heading", ".auth-plan", ".auth-field", ".auth-submit", ".auth-links"],
          { autoAlpha: 1, clearProps: "transform" }
        );
      });
    },
    { scope: formRef, dependencies: [success] }
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!nombreCompleto.trim()) {
      setError("El nombre completo es obligatorio.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          nombre_empresa:    nombreEmpresa,
          nombre_completo:   nombreCompleto,
          cargo,
          plan_seleccionado: planSeleccionado,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="grid min-h-screen md:grid-cols-[45fr_55fr]">
        <AuthPanel />
        <div className="flex flex-col items-center justify-center bg-background px-6 py-12">
          <motion.div
            className="w-full max-w-sm text-center"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {/* Animated check icon */}
            <motion.div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-leadby-500/30 bg-leadby-500/10"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.45, type: "spring", stiffness: 300, damping: 15 }}
            >
              <Mail className="h-7 w-7 text-leadby-500" />
            </motion.div>

            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Confirma tu email
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-black/60 dark:text-white/60">
              Hemos enviado un enlace de confirmación a{" "}
              <span className="font-semibold text-foreground">{email}</span>.
              Haz clic en él para activar tu cuenta.
            </p>
            <p className="mt-6 text-xs text-black/40 dark:text-white/40">
              ¿Problemas? Escribe a{" "}
              <a
                className="font-semibold text-leadby-500 hover:text-leadby-600"
                href="mailto:antonl11@ucm.es"
              >
                antonl11@ucm.es
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="grid min-h-screen md:grid-cols-[45fr_55fr]">
      <AuthPanel />

      <div className="flex flex-col items-center justify-start overflow-y-auto bg-background px-6 py-12 md:px-10 lg:px-16">
        <div ref={formRef} className="w-full max-w-sm">

          {/* Mobile-only logo */}
          <div className="auth-logo mb-8 flex justify-center md:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/LEADBY-Logo.png" alt="LeadBy" width={36} height={36} className="h-9 w-9" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">LeadBy</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="auth-heading mb-6">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              Crea tu cuenta
            </h1>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60">
              Configura tu organización y empieza a prospectar.
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="register-error"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0,  height: "auto" }}
                exit={  { opacity: 0, y: -8,  height: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} noValidate className="space-y-4">

            {/* Plan selector */}
            <div className="auth-plan">
              <label className="mb-2 block text-sm font-medium text-black/80 dark:text-white/80">
                Elige tu plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLANES.map((plan) => {
                  const isActive = planSeleccionado === plan.id;
                  return (
                    <motion.button
                      key={plan.id}
                      type="button"
                      onClick={() => setPlanSeleccionado(plan.id)}
                      whileTap={{ scale: 0.96 }}
                      className={[
                        "rounded-xl border p-3 text-left transition-all",
                        isActive
                          ? "border-leadby-500 bg-leadby-500/8 ring-2 ring-leadby-500/30"
                          : "border-black/10 hover:border-leadby-400/50 dark:border-white/10",
                      ].join(" ")}
                    >
                      <p className="text-sm font-semibold">{plan.nombre}</p>
                      <p className="mt-0.5 text-xs font-bold text-leadby-500">{plan.precio}</p>
                      <p className="mt-1 text-[11px] text-black/45 dark:text-white/45 leading-tight">
                        {plan.descripcion}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Nombre completo */}
            <div className="auth-field">
              <label htmlFor="reg-nombre" className="mb-1.5 block text-sm font-medium text-black/80 dark:text-white/80">
                Nombre completo
              </label>
              <input
                id="reg-nombre"
                type="text"
                required
                autoComplete="name"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 text-sm transition-all placeholder:text-black/30 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:border-white/10 dark:text-white dark:placeholder:text-white/25"
                placeholder="Ana García López"
              />
            </div>

            {/* Cargo */}
            <div className="auth-field">
              <label htmlFor="reg-cargo" className="mb-1.5 block text-sm font-medium text-black/80 dark:text-white/80">
                Cargo{" "}
                <span className="font-normal text-black/40 dark:text-white/40">(opcional)</span>
              </label>
              <input
                id="reg-cargo"
                type="text"
                autoComplete="organization-title"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 text-sm transition-all placeholder:text-black/30 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:border-white/10 dark:text-white dark:placeholder:text-white/25"
                placeholder="Director Comercial"
              />
            </div>

            {/* Empresa */}
            <div className="auth-field">
              <label htmlFor="reg-empresa" className="mb-1.5 block text-sm font-medium text-black/80 dark:text-white/80">
                Nombre de tu empresa
              </label>
              <input
                id="reg-empresa"
                type="text"
                required
                autoComplete="organization"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 text-sm transition-all placeholder:text-black/30 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:border-white/10 dark:text-white dark:placeholder:text-white/25"
                placeholder="Acme S.L."
              />
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-black/80 dark:text-white/80">
                Correo electrónico corporativo
              </label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 text-sm transition-all placeholder:text-black/30 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:border-white/10 dark:text-white dark:placeholder:text-white/25"
                placeholder="ana@empresa.com"
              />
            </div>

            {/* Contraseña */}
            <div className="auth-field">
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-black/80 dark:text-white/80">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 pr-11 text-sm transition-all placeholder:text-black/30 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:border-white/10 dark:text-white dark:placeholder:text-white/25"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 transition-colors hover:text-leadby-500 dark:text-white/35"
                >
                  <span className="sr-only">{showPassword ? "Ocultar" : "Mostrar"} contraseña</span>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="auth-field">
              <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-black/80 dark:text-white/80">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 pr-11 text-sm transition-all placeholder:text-black/30 focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/25 dark:border-white/10 dark:text-white dark:placeholder:text-white/25"
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-pressed={showConfirmPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 transition-colors hover:text-leadby-500 dark:text-white/35"
                >
                  <span className="sr-only">{showConfirmPassword ? "Ocultar" : "Mostrar"} contraseña</span>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
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
                      Creando cuenta…
                    </span>
                  ) : (
                    "Crear cuenta gratis"
                  )}
                </button>
              </Magnetic>
            </div>
          </form>

          {/* Footer links */}
          <div className="auth-links mt-6 space-y-3 text-center">
            <p className="text-sm text-black/60 dark:text-white/60">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-leadby-500 transition-colors hover:text-leadby-600"
              >
                Iniciar sesión
              </Link>
            </p>
            <p className="text-xs text-black/40 dark:text-white/40">
              Al registrarte aceptas nuestros{" "}
              <Link href="/legal/terms" className="underline hover:text-leadby-500">
                Términos de Servicio
              </Link>{" "}
              y{" "}
              <Link href="/legal/privacy" className="underline hover:text-leadby-500">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-black/50 dark:text-white/50">
          Cargando…
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
