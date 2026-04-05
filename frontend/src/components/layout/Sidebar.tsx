"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Search,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",      icon: LayoutDashboard },
  { href: "/prospecting",  label: "Prospección",    icon: Search },
  { href: "/leads",        label: "Leads",          icon: Users },
  { href: "/settings",     label: "Configuración",  icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-60 min-h-full bg-gray-950 flex flex-col border-r border-gray-800/60">

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-gray-800/60">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/LEADBY-Logo.png"
                alt="LeadBy"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="leading-none">
              <span className="block font-bold text-white text-sm tracking-wide">
                LEADBY
              </span>
              <span className="block text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">
                Optimización de Procesos
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-gray-800/60 transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-leadby-500/15 text-leadby-400 border border-leadby-500/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-leadby-400" : "text-gray-500"
                )}
              />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-leadby-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Cerrar sesión ── */}
      <div className="px-3 py-4 border-t border-gray-800/60">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800/60 w-full transition-all duration-150 border border-transparent"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
