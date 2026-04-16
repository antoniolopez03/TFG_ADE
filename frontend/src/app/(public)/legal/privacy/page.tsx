import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Aviso Legal y Política de Privacidad · LeadBy",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
