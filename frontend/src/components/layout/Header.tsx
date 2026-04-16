"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Magnetic } from "@/lib/animations/magnetic";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
  { href: "/precios", label: "Precios" },
  { href: "/blog", label: "Blog" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  // Switch to glassmorphism after 80px of scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Main header ──────────────────────────────────────────────────── */}
      <motion.header
        className={[
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "glass border-b border-white/8 py-4"
            : "border-b border-transparent bg-transparent py-6",
        ].join(" ")}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6">

          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/Logo.png"
                alt="LeadBy"
                width={200}
                height={200}
                className="h-10 w-10 flex-shrink-0 object-contain"
                priority
              />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                LeadBy
              </span>
            </Link>
          </motion.div>

          {/* Desktop nav — staggered entrance */}
          <nav
            aria-label="Principal"
            className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium md:flex"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + i * 0.06,
                  duration: 0.4,
                  ease: "easeOut",
                }}
              >
                <Link
                  href={link.href}
                  className="relative text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-leadby-500 after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="ml-auto flex items-center gap-3">
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4, ease: "easeOut" }}
            >
              <Magnetic strength={0.15}>
                <Link
                  href="/auth/login"
                  className="rounded-full border border-leadby-500 px-4 py-2 text-sm font-semibold text-leadby-500 transition-colors hover:bg-leadby-50 dark:hover:bg-white/5 animate-glow-pulse"
                >
                  Iniciar Sesión
                </Link>
              </Magnetic>
            </motion.div>

            <ThemeToggle />

            {/* Mobile hamburger */}
            <motion.button
              className="flex md:hidden items-center justify-center rounded-lg p-2 text-foreground/70 hover:text-foreground"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              whileTap={{ scale: 0.9 }}
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile menu ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />

            {/* Slide-in panel */}
            <motion.div
              key="mobile-panel"
              role="dialog"
              aria-label="Menú de navegación"
              className="fixed right-0 top-0 bottom-0 z-[70] w-[min(320px,90vw)] glass border-l border-white/8 flex flex-col p-8"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between mb-12">
                <Link
                  href="/"
                  className="text-sm font-semibold uppercase tracking-[0.18em]"
                  onClick={() => setMobileOpen(false)}
                >
                  LeadBy
                </Link>
                <motion.button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-foreground/70 hover:text-foreground"
                  aria-label="Cerrar menú"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-6 flex-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.3, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      className="text-xl font-semibold text-foreground/80 hover:text-foreground transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom CTA */}
              <Link
                href="/auth/login"
                className="mt-auto rounded-full bg-leadby-500 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-leadby transition-all hover:bg-leadby-600"
                onClick={() => setMobileOpen(false)}
              >
                Iniciar Sesión
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
