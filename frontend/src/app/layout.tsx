import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
    <html lang="es">
      <body className={`${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
