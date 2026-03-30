import Link from "next/link";
import { ArrowRight, Zap, Search, Brain, CheckCircle } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    titulo: "Prospección automatizada",
    desc: "El motor busca en Google Maps y LinkedIn de forma autónoma y extrae datos públicos de empresas B2B que encajan con tu perfil de cliente ideal.",
  },
  {
    icon: Brain,
    titulo: "IA Generativa (Gemini)",
    desc: "Analiza cada empresa potencial y redacta correos de prospección hiperpersonalizados, adaptados al tono de tu empresa y al contexto de cada venta.",
  },
  {
    icon: CheckCircle,
    titulo: "Human-in-the-Loop",
    desc: "Ningún email se envía sin tu aprobación. Revisa, edita y confirma cada correo antes de que llegue al CRM y a la bandeja de entrada del prospecto.",
  },
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
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">ProspectAI</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="#features" className="text-gray-500 hover:text-gray-900">Funcionalidades</Link>
          <Link href="/pricing" className="text-gray-500 hover:text-gray-900">Precios</Link>
          <Link href="/blog" className="text-gray-500 hover:text-gray-900">Blog</Link>
          <Link href="/auth/login" className="text-gray-500 hover:text-gray-900">Entrar</Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-700 border border-blue-100 mb-6">
          <Zap className="w-3 h-3" />
          Automatización de ventas B2B con IA
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Tu equipo comercial,<br />
          <span className="text-blue-600">10 veces más productivo</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Automatiza la prospección, el enriquecimiento de leads y la redacción de correos en frío con Inteligencia Artificial. Tu equipo solo cierra ventas.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base transition-colors"
          >
            Empieza gratis ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="px-6 py-3 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl text-base transition-colors"
          >
            Ver cómo funciona
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-400">Sin tarjeta de crédito · Free Tier permanente</p>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Todo el pipeline de ventas, automatizado
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Desde el descubrimiento del prospecto hasta el envío del email personalizado, sin intervención manual.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, titulo, desc }) => (
              <div key={titulo} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Precios simples y transparentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.nombre}
                className={`rounded-xl border p-6 ${plan.destacado ? "border-blue-500 shadow-lg shadow-blue-100" : "border-gray-100"}`}
              >
                {plan.destacado && (
                  <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-3">
                    Más popular
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-1">{plan.nombre}</h3>
                <p className="text-gray-400 text-xs mb-4">{plan.descripcion}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">{plan.precio}</span>
                  <span className="text-gray-400 text-sm">{plan.periodo}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/auth/register?plan=${plan.plan}`}
                  className={`block text-center py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                    plan.destacado
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">ProspectAI</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/legal/privacy" className="hover:text-gray-600">Privacidad</Link>
            <Link href="/legal/terms" className="hover:text-gray-600">Términos</Link>
            <Link href="/blog" className="hover:text-gray-600">Blog</Link>
          </div>
          <p className="text-xs text-gray-400">© 2025 ProspectAI · TFG UCM</p>
        </div>
      </footer>
    </div>
  );
}
