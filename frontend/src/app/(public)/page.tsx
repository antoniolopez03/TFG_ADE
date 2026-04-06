import { HeroSection } from "@/components/home/HeroSection";
import { VideoDemoSection } from "@/components/home/VideoDemoSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { MetricsSection } from "@/components/home/MetricsSection";
import { IntegrationsSection } from "@/components/home/IntegrationsSection";
import { TestimonialSection } from "@/components/home/TestimonialSection";
import { CtaFinalSection } from "@/components/home/CtaFinalSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <VideoDemoSection />
      <HowItWorksSection />
      <MetricsSection />
      <IntegrationsSection />
      <TestimonialSection />
      <CtaFinalSection />
    </>
  );
}
