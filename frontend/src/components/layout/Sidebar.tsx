"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Search,
  Users,
  Settings,
  LogOut,
  X,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",     icon: LayoutDashboard },
  { href: "/prospecting", label: "Prospección",   icon: Search },
  { href: "/leads",       label: "Leads",         icon: Users },
  { href: "/settings",    label: "Configuración", icon: Settings },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function handleSignOut() {
    setShowLogoutConfirm(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <aside className="w-60 min-h-full bg-gray-100 dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-800/60">
        {/* ── Logo ────────────────────────────────────────────────────── */}
        <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-800/60">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 group"
            >
              <motion.div
                className="relative w-10 h-10 flex-shrink-0"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.25 }}
              >
                <Image
                  src="/Logo.png"
                  alt="LeadBy"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
              <div className="leading-none">
                <span className="block font-bold text-gray-900 dark:text-white text-sm tracking-wide">
                  LEADBY
                </span>
                <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest mt-0.5">
                  Optimización de Procesos
                </span>
              </div>
            </Link>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Navegación ──────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "text-leadby-600 dark:text-leadby-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                )}
              >
                {/*
                 * layoutId="sidebar-active-pill" — framer-motion shared layout.
                 * When the active route changes, the pill animates (slides + morphs)
                 * from the previous nav item to the new one using a spring, giving
                 * the impression of a continuous indicator rather than a hard cut.
                 */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-lg bg-leadby-50 dark:bg-leadby-500/15 border border-leadby-200 dark:border-leadby-500/20"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}

                <Icon
                  className={cn(
                    "relative z-10 w-4 h-4 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-leadby-500 dark:text-leadby-400"
                      : "text-gray-400 dark:text-gray-500"
                  )}
                />
                <span className="relative z-10">{label}</span>

                {isActive && (
                  <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-leadby-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Cerrar sesión ────────────────────────────────────────────── */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800/60">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 w-full transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Logout confirmation modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              key="logout-backdrop"
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowLogoutConfirm(false)}
              aria-hidden
            />

            {/* Modal */}
            <motion.div
              key="logout-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              className="fixed left-1/2 top-1/2 z-[60] w-80 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={  { opacity: 0, scale: 0.92,  y: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              {/* Warning icon */}
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>

              <h3
                id="logout-title"
                className="mb-2 text-base font-semibold text-gray-900 dark:text-white"
              >
                ¿Cerrar sesión?
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Se cerrará tu sesión en este dispositivo. Podrás volver a
                entrar en cualquier momento.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
