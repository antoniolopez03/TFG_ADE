import type { Metadata } from "next";
import { TermsContent } from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Términos de Servicio · LeadBy",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return <TermsContent />;
}
