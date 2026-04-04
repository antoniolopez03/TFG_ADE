"use client";

import { usePathname } from "next/navigation";
import { Menu, UserCircle } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] flex-shrink-0">
      {/* Left */}
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
        <button
          type="button"
          aria-label="Perfil de usuario"
          className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <UserCircle className="w-7 h-7" />
        </button>
      </div>
    </header>
  );
}
