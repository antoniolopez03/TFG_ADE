import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/lib/animations/reveal";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCT_LINKS = [
  { href: "/(saas)/dashboard", label: "Dashboard" },
  { href: "/(saas)/prospecting", label: "Motor de prospección" },
  { href: "/(saas)/leads", label: "Bandeja de leads" },
  { href: "/precios", label: "Precios" },
];

const COMPANY_LINKS = [
  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
  { href: "/blog", label: "Blog & Recursos" },
  { href: "/contact", label: "Contacto" },
];

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Términos de uso" },
  { href: "/legal/privacy", label: "Política de privacidad" },
  { href: "/legal/cookies", label: "Política de cookies" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/8 dark:border-white/8 pt-16 pb-8">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal direction="up" threshold={0.05}>
          {/* ── 4-column grid ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">

            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
                <Image
                  src="/LEADBY-Logo.png"
                  alt="LeadBy"
                  width={36}
                  height={36}
                  className="h-9 w-9 flex-shrink-0 object-contain"
                />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">LeadBy</span>
              </Link>
              <p className="text-sm leading-relaxed text-black/55 dark:text-white/55 max-w-[260px]">
                Plataforma B2B de prospección comercial automatizada con IA.
                Descubre leads, enriquece contactos y cierra más contratos.
              </p>
              <p className="mt-4 text-xs text-black/35 dark:text-white/35">
                TFG · Universidad Complutense de Madrid · 2025–2026
              </p>
            </div>

            {/* Producto */}
            <FooterColumn title="Producto" links={PRODUCT_LINKS} />

            {/* Empresa */}
            <FooterColumn title="Empresa" links={COMPANY_LINKS} />

            {/* Legal */}
            <FooterColumn title="Legal" links={LEGAL_LINKS} />
          </div>

          {/* ── Bottom bar ──────────────────────────────────────────────── */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-black/6 dark:border-white/6 pt-6">
            <p className="text-xs text-black/50 dark:text-white/50">
              © {year} LeadBy. Todos los derechos reservados.
            </p>
            <p className="text-xs text-black/35 dark:text-white/35">
              TFG — Antonio López Belinchón · UCM
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}

// ─── Column helper ────────────────────────────────────────────────────────────

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
