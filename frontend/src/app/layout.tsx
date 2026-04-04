import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const themeScript = `(() => {
  try {
    const stored = localStorage.getItem("theme");
    const theme = stored === "dark" ? "dark" : "light";
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  } catch (_) {
    /* no-op */
  }
})();`;

export const metadata: Metadata = {
  title: {
    default: "LeadBy — Optimización de Procesos",
    template: "%s · LeadBy",
  },
  description:
    "Plataforma B2B de prospección comercial automatizada con IA. Descubre leads, enriquece contactos y envía correos hiperpersonalizados en un solo flujo.",
  keywords: ["prospección B2B", "automatización ventas", "CRM", "leads", "IA generativa"],
  authors: [{ name: "LeadBy" }],
  openGraph: {
    title: "LeadBy — Optimización de Procesos",
    description: "Automatiza tu prospección comercial con IA.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased`}>
        <Script id="theme-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
          <div id="global-banner" />
          {children}
        </div>
      </body>
    </html>
  );
}
