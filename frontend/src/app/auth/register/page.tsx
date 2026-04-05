"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Plan = "free" | "starter" | "pro";

const PLANES: { id: Plan; nombre: string; precio: string; descripcion: string }[] = [
  { id: "free", nombre: "Free", precio: "0€", descripcion: "Hasta 50 leads/mes" },
  { id: "starter", nombre: "Starter", precio: "49€/mes", descripcion: "Hasta 500 leads/mes" },
  { id: "pro", nombre: "Pro", precio: "99€/mes", descripcion: "Leads ilimitados + IA" },
];

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const planParam = (searchParams.get("plan") ?? "free") as Plan;

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [cargo, setCargo] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan>(
    PLANES.find((p) => p.id === planParam) ? planParam : "free"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

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
          nombre_empresa: nombreEmpresa,
          nombre_completo: nombreCompleto,
          cargo: cargo,
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

  const decorativeBlobs = (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-leadby-500/15 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-leadby-400/20 blur-3xl" />
    </div>
  );

  if (success) {
    return (
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        {decorativeBlobs}
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
          <h2 className="text-2xl font-semibold text-foreground">Confirma tu email</h2>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            Hemos enviado un enlace de confirmación a{" "}
            <span className="font-semibold text-foreground">{email}</span>. Haz clic en él para activar tu cuenta.
          </p>
          <p className="mt-6 text-xs text-black/60 dark:text-white/60">
            ¿Problemas? Escribe a{" "}
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
      {decorativeBlobs}

      <div className="relative w-full max-w-lg rounded-2xl border border-black/5 bg-white/80 p-8 shadow-sm shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
            <Image src="/LEADBY-Logo.png" alt="LeadBy" width={48} height={48} className="h-12 w-12" priority />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-black/70 dark:text-white/70">
            Configura tu organización y empieza a prospectar.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Plan selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black/80 dark:text-white/80">
              Elige tu plan
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PLANES.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setPlanSeleccionado(plan.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    planSeleccionado === plan.id
                      ? "border-leadby-500 bg-leadby-50/70 ring-2 ring-leadby-500/40 dark:bg-leadby-500/10"
                      : "border-black/10 hover:border-leadby-400/60 dark:border-white/10"
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">{plan.nombre}</p>
                  <p className="mt-0.5 text-xs font-bold text-leadby-500">{plan.precio}</p>
                  <p className="mt-1 text-xs text-black/50 dark:text-white/50">{plan.descripcion}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre completo */}
          <div>
            <label htmlFor="nombreCompleto" className="mb-1 block text-sm font-medium text-black/80 dark:text-white/80">
              Nombre completo
            </label>
            <input
              id="nombreCompleto"
              type="text"
              required
              autoComplete="name"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm text-black/90 shadow-sm transition focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Ana García López"
            />
          </div>

          {/* Cargo */}
          <div>
            <label htmlFor="cargo" className="mb-1 block text-sm font-medium text-black/80 dark:text-white/80">
              Cargo{" "}
              <span className="font-normal text-black/40 dark:text-white/40">(opcional)</span>
            </label>
            <input
              id="cargo"
              type="text"
              autoComplete="organization-title"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm text-black/90 shadow-sm transition focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Director Comercial"
            />
          </div>

          {/* Nombre empresa */}
          <div>
            <label htmlFor="empresa" className="mb-1 block text-sm font-medium text-black/80 dark:text-white/80">
              Nombre de tu empresa
            </label>
            <input
              id="empresa"
              type="text"
              required
              autoComplete="organization"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm text-black/90 shadow-sm transition focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Acme S.L."
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-black/80 dark:text-white/80">
              Correo electrónico corporativo
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-sm text-black/90 shadow-sm transition focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="ana@empresa.com"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-black/80 dark:text-white/80">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 pr-11 text-sm text-black/90 shadow-sm transition focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Mínimo 8 caracteres"
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

          {/* Confirmar contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-black/80 dark:text-white/80">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white/90 px-3 py-2 pr-11 text-sm text-black/90 shadow-sm transition focus:border-leadby-500 focus:outline-none focus:ring-2 focus:ring-leadby-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Repite tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-pressed={showConfirmPassword}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-black/60 transition hover:text-leadby-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leadby-500/40 dark:text-white/60"
              >
                <span className="sr-only">{showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-leadby-500 px-4 py-2.5 text-sm font-semibold text-white shadow-leadby-sm transition hover:bg-leadby-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-black/60 dark:text-white/60">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="font-semibold text-leadby-500 hover:text-leadby-600 transition-colors">
            Iniciar sesión
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-black/40 dark:text-white/40">
          Al registrarte aceptas nuestros{" "}
          <Link href="/legal/terms" className="underline hover:text-leadby-500">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="/legal/privacy" className="underline hover:text-leadby-500">
            Política de Privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-black/50 dark:text-white/50">
          Cargando...
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
