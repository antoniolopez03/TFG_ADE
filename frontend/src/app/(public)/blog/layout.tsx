import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Recursos y guías prácticas sobre prospección comercial B2B, automatización de ventas e inteligencia artificial aplicada al sector industrial.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
