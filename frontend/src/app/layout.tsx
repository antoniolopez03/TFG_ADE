import type { Metadata } from "next";
import localFont from "next/font/local";
import { Chakra_Petch } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hk-modular",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

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
  metadataBase: new URL(appUrl),
  title: {
    default: "LeadBy — Optimización de Procesos",
    template: "%s · LeadBy",
  },
  description:
    "Plataforma B2B de prospección comercial automatizada con IA. Descubre leads, enriquece contactos y envía correos hiperpersonalizados en un solo flujo.",
  keywords: ["prospección B2B", "automatización ventas", "CRM", "leads", "IA generativa"],
  authors: [{ name: "LeadBy" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LeadBy — Optimización de Procesos",
    description: "Automatiza tu prospección comercial con IA.",
    url: appUrl,
    siteName: "LeadBy",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/images/og-cover.svg",
        width: 1200,
        height: 630,
        alt: "LeadBy · Prospección comercial B2B con IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadBy — Optimización de Procesos",
    description: "Automatiza tu prospección comercial con IA.",
    images: ["/images/og-cover.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistMono.variable} ${chakraPetch.variable} antialiased`}>
        <Script id="theme-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AnimatedBackground />
        <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
          <div id="global-banner" />
          {children}
        </div>
      </body>
    </html>
  );
}
