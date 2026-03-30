import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Brain, CheckCircle, Zap, Shield, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    titulo: "Prospección automatizada",
    desc: "El motor navega Google Maps y LinkedIn de forma autónoma, extrayendo datos públicos de empresas B2B que encajan exactamente con tu perfil de cliente ideal.",
  },
  {
    icon: Brain,
    titulo: "IA Generativa (Gemini)",
    desc: "Analiza cada empresa y redacta correos de prospección hiperpersonalizados, adaptados al tono de tu empresa y al contexto único de cada oportunidad.",
  },
  {
    icon: CheckCircle,
    titulo: "Human-in-the-Loop",
    desc: "Ningún email se envía sin tu aprobación. Revisa, edita y confirma cada borrador antes de que llegue al CRM y a la bandeja del prospecto.",
  },
];

const STATS = [
  { valor: "10×", label: "Más productividad comercial" },
  { valor: "< 2 min", label: "De búsqueda a lead enriquecido" },
  { valor: "0 €", label: "Coste de infraestructura MVP" },
];

const PRICING_PLANS = [
  {
    nombre: "Free",
    precio: "0€",
    periodo: "/mes",
    descripcion: "Para validar el concepto",
    features: ["20 leads/mes", "Google Maps scraping", "1 usuario", "Integración HubSpot"],
    cta: "Empezar gratis",
    plan: "free",
    destacado: false,
  },
  {
    nombre: "Starter",
    precio: "49€",
    periodo: "/mes",
    descripcion: "Para equipos comerciales pequeños",
    features: ["200 leads/mes", "Google Maps + Dorks", "3 usuarios", "IA Lookalike", "Soporte prioritario"],
    cta: "Prueba 14 días gratis",
    plan: "starter",
    destacado: true,
  },
  {
    nombre: "Pro",
    precio: "149€",
    periodo: "/mes",
    descripcion: "Para agencias y equipos grandes",
    features: ["Leads ilimitados", "Todos los modos", "Usuarios ilimitados", "API access", "Onboarding dedicado"],
    cta: "Contactar ventas",
    plan: "pro",
    destacado: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image src="/LEADBY-Logo.png" alt="LeadBy" fill className="object-contain" priority />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-wide uppercase">LeadBy</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm">
            <Link href="#features" className="text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Funcionalidades
            </Link>
            <Link href="#pricing" className="text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Precios
            </Link>
            <Link href="/auth/login" className="text-gray-500 hover:text-gray-900 transition-colors font-medium">
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-leadby-500 hover:bg-leadby-600 text-white font-semibold rounded-lg text-sm transition-all duration-150 shadow-leadby-sm"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          HERO — Fondo oscuro con acento naranja
      ════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-leadby-hero">
        {/* Glow de fondo */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,102,0,0.18) 0%, transparent 70%)",
          }}
        />
        {/* Patrón de cuadrícula sutil */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-leadby-500/10 border border-leadby-500/25 rounded-full text-xs font-semibold text-leadby-400 mb-8 tracking-wide uppercase">
            <Zap className="w-3 h-3" />
            Automatización de ventas B2B con IA
          </div>

          {/* Titular */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.08] mb-6 tracking-tight">
            Tu equipo comercial,{" "}
            <span className="text-leadby-gradient">
              10 veces más productivo
            </span>
          </h1>

          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Automatiza la prospección, el enriquecimiento de leads y la redacción de correos
            en frío con Inteligencia Artificial. Tu equipo solo cierra ventas.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/register"
              className="flex items-center gap-2.5 px-7 py-3.5 bg-leadby-500 hover:bg-leadby-600 text-white font-bold rounded-xl text-base transition-all duration-150 shadow-leadby"
            >
              Empieza gratis ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-7 py-3.5 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl text-base transition-all duration-150"
            >
              Ver cómo funciona
            </Link>
          </div>
          <p className="mt-5 text-xs text-gray-600 font-medium">
            Sin tarjeta de crédito · Free Tier permanente · Despliegue en minutos
          </p>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-gray-800/60 pt-10">
            {STATS.map(({ valor, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-leadby-400">{valor}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-leadby-500 uppercase tracking-widest mb-3">
              Cómo funciona
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Todo el pipeline de ventas, automatizado
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base leading-relaxed">
              Desde el descubrimiento del prospecto hasta el envío del email personalizado,
              sin intervención manual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, titulo, desc }, i) => (
              <div
                key={titulo}
                className="bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="w-11 h-11 bg-leadby-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-leadby-100 transition-colors">
                  <Icon className="w-5 h-5 text-leadby-500" />
                </div>
                <div className="text-xs font-bold text-leadby-400 uppercase tracking-widest mb-2">
                  Paso {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST STRIP
      ════════════════════════════════════════ */}
      <section className="py-12 px-6 border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, titulo: "RGPD compliant", desc: "Datos procesados bajo la normativa europea." },
            { icon: Zap, titulo: "Free Tier permanente", desc: "Sin costes fijos de infraestructura." },
            { icon: TrendingUp, titulo: "Data Moat propio", desc: "Tu caché B2B crece con cada búsqueda." },
          ].map(({ icon: Icon, titulo, desc }) => (
            <div key={titulo} className="flex items-start gap-4">
              <div className="w-9 h-9 bg-leadby-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-leadby-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{titulo}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICING
      ════════════════════════════════════════ */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-leadby-500 uppercase tracking-widest mb-3">Precios</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Simples y transparentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.nombre}
                className={`rounded-2xl border p-7 flex flex-col ${
                  plan.destacado
                    ? "border-leadby-400 shadow-leadby bg-white relative"
                    : "border-gray-100 bg-white"
                }`}
              >
                {plan.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-leadby-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                    Más popular
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="font-extrabold text-gray-900 text-lg mb-0.5">{plan.nombre}</h3>
                  <p className="text-gray-400 text-xs">{plan.descripcion}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.precio}</span>
                  <span className="text-gray-400 text-sm">{plan.periodo}</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-leadby-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/auth/register?plan=${plan.plan}`}
                  className={`block text-center py-3 px-4 rounded-xl font-bold text-sm transition-all duration-150 ${
                    plan.destacado
                      ? "bg-leadby-500 hover:bg-leadby-600 text-white shadow-leadby-sm"
                      : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-leadby-hero relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(255,102,0,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Empieza a prospectar hoy
          </h2>
          <p className="text-gray-400 mb-8 text-base">
            Tu primer lead en menos de 2 minutos. Sin tarjeta de crédito.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-leadby-500 hover:bg-leadby-600 text-white font-bold rounded-xl text-base transition-all duration-150 shadow-leadby"
          >
            Crear cuenta gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="bg-gray-950 border-t border-gray-800/60 py-10 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image src="/LEADBY-Logo.png" alt="LeadBy" fill className="object-contain" />
            </div>
            <div>
              <span className="block font-bold text-white text-xs tracking-widest uppercase">LeadBy</span>
              <span className="block text-[9px] text-gray-600 uppercase tracking-widest">Optimización de Procesos</span>
            </div>
          </Link>

          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/legal/privacy" className="hover:text-gray-300 transition-colors">Privacidad</Link>
            <Link href="/legal/terms" className="hover:text-gray-300 transition-colors">Términos</Link>
          </div>

          <p className="text-xs text-gray-600">© 2025 LeadBy · TFG UCM</p>
        </div>
      </footer>
    </div>
  );
}
