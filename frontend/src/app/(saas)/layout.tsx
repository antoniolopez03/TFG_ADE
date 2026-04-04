import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SaaSLayout } from "@/components/layout/SaaSLayout";

export default async function SaaSRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <SaaSLayout>{children}</SaaSLayout>;
}
