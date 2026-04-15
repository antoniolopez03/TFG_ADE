import { HeroSection } from "@/components/home/HeroSection";
import { LogoTicker } from "@/components/home/LogoTicker";
import { VideoDemoSection } from "@/components/home/VideoDemoSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { MetricsSection } from "@/components/home/MetricsSection";
import { IntegrationsSection } from "@/components/home/IntegrationsSection";
import { TestimonialSection } from "@/components/home/TestimonialSection";
import { CtaFinalSection } from "@/components/home/CtaFinalSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeadBy — Automatización comercial B2B con IA",
  description:
    "Multiplica tu prospección B2B con IA y Human-in-the-Loop: búsqueda de empresas, correos hiperpersonalizados y sincronización CRM en un solo flujo.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      {/* Social proof ticker — shown immediately after the Hero fold */}
      <LogoTicker />
      <VideoDemoSection />
      <HowItWorksSection />
      <MetricsSection />
      <IntegrationsSection />
      <TestimonialSection />
      <CtaFinalSection />
    </>
  );
}
