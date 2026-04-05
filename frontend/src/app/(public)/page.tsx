import { HeroSection } from "@/components/landing/HeroSection";
import { TechSection } from "@/components/landing/TechSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { VideoSection } from "@/components/landing/VideoSection";
import { IndustrySection } from "@/components/landing/IndustrySection";
import { CtaSection } from "@/components/landing/CtaSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TechSection />
      <BenefitsSection />
      <VideoSection />
      <IndustrySection />
      <CtaSection />
    </>
  );
}
