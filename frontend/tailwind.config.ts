import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--leadby-primary)",
        secondary: "var(--leadby-secondary)",
        leadby: {
          50: "#fff4ee",
          100: "#ffe6d6",
          200: "#ffd1b5",
          300: "#ffb88f",
          400: "#ff914d",
          500: "#ff751f",
          600: "#e66617",
          700: "#cc5b14",
          800: "#99440f",
          900: "#66300a",
        },
      },
      fontFamily: {
        sans: ["var(--font-hk-modular)", "system-ui", "sans-serif"],
        display: ["var(--font-hk-modular)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        // ── Existing ──────────────────────────────────────────────────────
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "pulse-orange": "pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        // ── Phase 0 additions ─────────────────────────────────────────────
        /** Gentle vertical float for decorative glow orbs */
        "float": "float 6s ease-in-out infinite",
        /** Orange box-shadow pulse for CTA buttons */
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        /** Logo / text ticker — infinite horizontal scroll */
        "ticker": "ticker 25s linear infinite",
        /** Animated background-position for gradient sections */
        "gradient-shift": "gradient-shift 8s ease infinite",
        /** Premium slide-up + blur-clear entrance */
        "slide-in-blur": "slide-in-blur 0.7s ease-out forwards",
      },
      keyframes: {
        // ── Existing ──────────────────────────────────────────────────────
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-orange": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        // ── Phase 0 additions ─────────────────────────────────────────────
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px 4px rgba(255, 117, 31, 0.20)",
          },
          "50%": {
            boxShadow: "0 0 35px 8px rgba(255, 117, 31, 0.40)",
          },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.333%)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "slide-in-blur": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
            filter: "blur(8px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
            filter: "blur(0px)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
