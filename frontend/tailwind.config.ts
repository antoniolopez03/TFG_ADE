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
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "pulse-orange": "pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
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
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
