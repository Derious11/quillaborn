import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AdminUsersPage from "@/components/admin/AdminUsersPage";

export default async function Page({ searchParams }: { searchParams?: { q?: string; page?: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!me || !["admin", "owner"].includes(me.role)) redirect("/403");

  const q = (searchParams?.q ?? "").slice(0, 120);
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const pageSize = 25;
  const offset = (page - 1) * pageSize;

  const { data: rows, error } = await supabase.rpc("admin_get_user_overview", {
    p_limit: pageSize,
    p_offset: offset,
    p_search: q,
  });

  const { data: badges } = await supabase
    .from("badges")
    .select("id, name, icon_url")
    .order("created_at");

  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("user_id, badges(id, name, description, icon_url)")
    .order("assigned_at");

  const badgeMap: Record<string, any[]> = {};
  (userBadges ?? []).forEach((ub) => {
    if (!ub.user_id || !ub.badges) return;
    if (!badgeMap[ub.user_id]) badgeMap[ub.user_id] = [];
    badgeMap[ub.user_id].push(ub.badges);
  });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Admin · Users</h1>
        <pre className="mt-4 text-sm text-red-600">RPC error: {error.message}</pre>
      </main>
    );
  }

  return (
    <AdminUsersPage
      q={q}
      page={page}
      pageSize={pageSize}
      rows={rows ?? []}
      badges={badges ?? []}
      badgeMap={badgeMap}
    />
  );
}
