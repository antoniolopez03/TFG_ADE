import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CursorEffect } from "@/components/landing/CursorEffect";
import { ScrollProgress } from "@/components/landing/ScrollProgress";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CursorEffect />
      <ScrollProgress />
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
