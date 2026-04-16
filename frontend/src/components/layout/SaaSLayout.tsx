"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeaderSaaS } from "@/components/layout/HeaderSaaS";
import { PageTransition } from "@/components/layout/PageTransition";

export function SaaSLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar — AnimatePresence for smooth open/close */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-sidebar-backdrop"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden
            />

            {/* Drawer */}
            <motion.div
              key="mobile-sidebar-drawer"
              className="fixed inset-y-0 left-0 z-50 md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <HeaderSaaS onMenuClick={() => setIsSidebarOpen(true)} />
        {/*
         * PageTransition envuelve {children} y gestiona:
         *  • Primera carga → fade-in + slide-up (GSAP).
         *  • Cambio de ruta → wipe naranja (Fase 10, Plan UI/UX).
         * El <main> mantiene overflow-y-auto para scroll interno de páginas.
         */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
