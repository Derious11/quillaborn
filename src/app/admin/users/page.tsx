// app/admin/users/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer"; // adjust to your helper

type Props = { searchParams?: { q?: string; page?: string } };

export default async function AdminUsersPage({ searchParams }: Props) {
  const supabase = createSupabaseServerClient();

  // 1) Session + role guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!me || !["admin", "owner"].includes(me.role)) redirect("/403");

  // 2) Inputs
  const q = (searchParams?.q ?? "").slice(0, 120);
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const pageSize = 25;
  const offset = (page - 1) * pageSize;

  // 3) Data
  const { data: rows, error } = await supabase.rpc("admin_get_user_overview", {
    p_limit: pageSize,
    p_offset: offset,
    p_search: q,
  });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Admin · Users</h1>
        <pre className="mt-4 text-sm text-red-600">RPC error: {error.message}</pre>
      </main>
    );
  }

  // 4) Render
  return (
  <>
    <div className="flex items-center justify-between gap-4 mb-6">
      <h1 className="text-3xl font-extrabold">Admin · Users</h1>
      <form className="flex gap-2" action="/admin/users" method="GET">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email or username"
          className="border border-white/10 bg-white/5 focus:bg-white/10 placeholder:text-gray-400 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button className="px-4 py-2 rounded-full border border-white/10 text-sm hover:bg-white/10">
          Search
        </button>
        <a
          className="px-4 py-2 rounded-full border border-white/10 text-sm hover:bg-white/10"
          href={`/admin/users/export.csv?q=${encodeURIComponent(q)}`}
        >
          Export CSV
        </a>
      </form>
    </div>

    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-gray-300">
          <tr>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Username</th>
            <th className="p-3 text-left">Waitlist</th>
            <th className="p-3 text-left">Onboarding</th>
            <th className="p-3 text-left">Early Access</th>
            <th className="p-3 text-left">Last Login</th>
            <th className="p-3 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((r: any) => (
            <tr key={r.user_id} className="border-t border-white/5">
              <td className="p-3">{r.email}</td>
              <td className="p-3">{r.username ?? "—"}</td>
              <td className="p-3">{r.waitlist_status ?? "—"}</td>
              <td className="p-3">
                {r.onboarding_complete ? "✅ Complete" : `Step ${r.onboarding_step ?? 0}`}
              </td>
              <td className="p-3">{r.early_access ? "Yes" : "No"}</td>
              <td className="p-3">
                {r.last_sign_in_at ? new Date(r.last_sign_in_at).toLocaleString() : "—"}
              </td>
              <td className="p-3">{r.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <Pagination page={page} q={q} hasMore={(rows?.length ?? 0) === pageSize} />
  </>
);
}

function Pagination({ page, q, hasMore }: { page: number; q: string; hasMore: boolean }) {
  const prev = Math.max(1, page - 1);
  const next = page + 1;
  return (
    <div className="flex items-center gap-3">
      <a
        className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
        href={`/admin/users?page=${prev}&q=${encodeURIComponent(q)}`}
        aria-disabled={page <= 1}
      >
        ← Prev
      </a>
      <span className="text-sm">Page {page}</span>
      <a
        className={`px-3 py-2 rounded-lg border text-sm ${!hasMore ? "opacity-50 pointer-events-none" : ""}`}
        href={`/admin/users?page=${next}&q=${encodeURIComponent(q)}`}
        aria-disabled={!hasMore}
      >
        Next →
      </a>
    </div>
  );
}
