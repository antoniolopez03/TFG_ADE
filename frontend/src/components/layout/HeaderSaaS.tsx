"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, UserCircle, LogOut, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":   "Dashboard",
  "/prospecting": "Prospección",
  "/leads":       "Bandeja de Leads",
  "/settings":    "Configuración",
};

function usePageTitle(): string {
  const pathname = usePathname();
  const match = Object.entries(PAGE_TITLES).find(([href]) =>
    pathname === href || pathname.startsWith(`${href}/`)
  );
  return match ? match[1] : "LeadBy";
}

interface HeaderSaaSProps {
  onMenuClick: () => void;
}

export function HeaderSaaS({ onMenuClick }: HeaderSaaSProps) {
  const title = usePageTitle();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const authClient = supabase.auth;

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user email once on mount
  useEffect(() => {
    authClient.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, [authClient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 flex-shrink-0">  {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-label="Perfil de usuario"
            onClick={() => setOpen((v) => !v)}
            className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <UserCircle className="w-7 h-7" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-lg overflow-hidden z-50">  {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-leadby-500/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-5 h-5 text-leadby-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      Mi cuenta
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {email ?? "Cargando..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  Configuración
                </Link>
              </div>

              {/* Sign out */}
              <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
