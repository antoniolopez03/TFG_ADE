import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma inteligente.
 * clsx: permite condiciones, arrays y objetos
 * twMerge: resuelve conflictos de clases de Tailwind (ej: p-2 vs p-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
