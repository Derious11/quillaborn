// app/admin/metrics/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function AdminMetricsPage() {
  const supabase = createSupabaseServerClient();

  // Guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || !["admin", "owner"].includes(me.role)) redirect("/403");

  // Counts
  const [{ count: waitlistPending }] = await Promise.all([
    supabase.from("waitlist").select("*", { count: "exact", head: true }).eq("status", "Pending"),
  ]);

  const { count: usersTotal } = await supabase.from("profiles").select("*", { count: "exact", head: true });

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { count: users7d } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since.toISOString());

  const { count: onboardingComplete } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("onboarding_complete", true);

  return (
    <main>
      <h1 className="text-3xl font-extrabold mb-6">Admin · Metrics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Users (Total)" value={usersTotal ?? 0} />
        <MetricCard title="New Users (7d)" value={users7d ?? 0} />
        <MetricCard title="Onboarding Complete" value={onboardingComplete ?? 0} />
        <MetricCard title="Waitlist Pending" value={waitlistPending ?? 0} />
      </div>
      <p className="mt-6 text-sm text-gray-400">
        Later: add activation funnel, DAU/WAU, completion by step, cohort charts, etc.
      </p>
    </main>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur p-5">
      <div className="text-gray-400 text-sm">{title}</div>
      <div className="text-3xl font-extrabold mt-1">{value}</div>
    </div>
  );
}
