"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
    return;
  }
  root.classList.remove("dark");
  root.style.colorScheme = "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    const resolved: Theme = stored === "dark" ? "dark" : "light";
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  const label = theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  function handleToggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  if (!mounted) {
    return (
      <div
        className={cn("h-10 w-10 rounded-full border border-transparent", className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      title={label}
      aria-pressed={theme === "dark"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-leadby-500/40 text-leadby-500",
        "transition-colors hover:bg-leadby-50 dark:hover:bg-gray-900",
        className
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
