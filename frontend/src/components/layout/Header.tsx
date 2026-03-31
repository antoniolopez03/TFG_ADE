import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
  { href: "/precios", label: "Precios" },
  { href: "/blog", label: "Recursos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-background/80 backdrop-blur dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image src="/LEADBY-Logo.png" alt="LeadBy" fill className="object-contain" priority />
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">LeadBy</span>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-full border border-leadby-500 px-4 py-2 text-sm font-semibold text-leadby-500 transition-colors hover:bg-leadby-50 dark:hover:bg-white/5"
          >
            Iniciar Sesi&#243;n
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
