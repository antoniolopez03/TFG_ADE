import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CursorEffect } from "@/components/landing/CursorEffect";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { ScrollProvider } from "@/lib/animations/scroll-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScrollProvider>
      <CursorEffect />
      <ScrollProgress />
      <Header />
      <main className="flex flex-1 flex-col light-hero-bg dark:bg-transparent">
        {children}
      </main>
      <Footer />
    </ScrollProvider>
  );
}
