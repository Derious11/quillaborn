import { createSupabaseServerClient } from "@/lib/supabaseServer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { Profile } from "@/lib/types";

export default async function ProjectRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>; // Public view: no sidebar
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile) {
    return <>{children}</>;
  }

  return <DashboardLayout user={user} profile={profile}>{children}</DashboardLayout>;
}
