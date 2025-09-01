// app/admin/waitlist/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import WaitlistFilters from "@/components/admin/WaitlistFilters";

type Search = { q?: string; page?: string; status?: string; msg?: string; err?: string };
type Props = { searchParams?: Search };

export default async function AdminWaitlistPage({ searchParams }: Props) {
  const supabase = createSupabaseServerClient();

  // ---- Guard: admin/owner only ----
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || !["admin", "owner"].includes(me.role)) redirect("/403");

  // ---- Inputs ----
  const q = (searchParams?.q ?? "").slice(0, 120);
  const status = (searchParams?.status ?? "pending") as "pending" | "approved" | "joined" | "All";
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // ---- Data query ----
  let query = supabase
    .from("waitlist")
    .select(
      "id,email,status,referred_by,notes,created_at,last_nudge_at,nudge_count,last_nudge_status",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) query = query.ilike("email", `%${q}%`);
  if (status !== "All") query = query.eq("status", status);

  const { data: rows, count, error } = await query;
  if (error) {
    return (
      <main>
        <h1 className="text-3xl font-extrabold mb-6">Admin · Waitlist</h1>
        <pre className="text-red-400 text-sm">Error: {error.message}</pre>
      </main>
    );
  }

  const total = count ?? 0;
  const hasMore = (from + (rows?.length ?? 0)) < total;

  // Build “clear” links to dismiss popup while preserving filters
  const baseQS = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    page: String(page),
  });

  const clearMsgHref = `/admin/waitlist?${baseQS.toString()}`; // no msg/err
  const msg = searchParams?.msg ?? "";
  const err = searchParams?.err ?? "";

  return (
    <main>
      {/* Popup messages (no client JS) */}
      {(msg || err) && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <div
            className={`rounded-xl border px-5 py-4 shadow-xl text-base font-medium ${
              err
                ? "border-red-600 bg-red-500/90 text-white"
                : "border-green-600 bg-green-500/90 text-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="font-semibold">{err ? "Error" : "Success"}:</span>
              <span className="flex-1">{err || msg}</span>
              <a
                href={clearMsgHref}
                className="ml-auto -mr-1 -mt-1 rounded px-2 py-1 hover:bg-black/20"
                aria-label="Dismiss"
                title="Dismiss"
              >
                ×
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-extrabold">Admin · Waitlist</h1>
        <div className="text-sm text-gray-400">{total} total</div>
      </div>

      {/* Search + filters */}
      <WaitlistFilters q={q} status={status} base="/admin/waitlist" />

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Referred By</th>
              <th className="p-3 text-left">Notes</th>
              <th className="p-3 text-left">Added</th>
              <th className="p-3 text-left">Nudge</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => {
              const lastNudge = r.last_nudge_at ? new Date(r.last_nudge_at) : null;
              const canSend = !lastNudge || (Date.now() - lastNudge.getTime() >= 24 * 60 * 60 * 1000);
              const tooltip = lastNudge
                ? `Last nudged ${lastNudge.toLocaleString()}`
                : "Never nudged";

              return (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.referred_by ?? "—"}</td>
                  <td className="p-3">{r.notes ?? "—"}</td>
                  <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">
                        {lastNudge ? `Nudged ${lastNudge.toLocaleString()}` : "Never nudged"}
                        {typeof r.nudge_count === "number" ? ` (${r.nudge_count})` : ""}
                      </span>
                      {r.last_nudge_status && (
                        <span className="text-xs mt-0.5 text-gray-500">
                          Status: {r.last_nudge_status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {/* Standalone form per row */}
                      <form action="/admin/waitlist/nudge" method="POST">
                      <input type="hidden" name="id" value={`${r.id}`} />
                      {/* Button posts directly — no nested form issues */}
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-full border border-white/10 text-xs hover:bg-white/10 disabled:opacity-50"
                        disabled={!canSend}
                        title={tooltip}
                      >
                        Send Nudge
                      </button>
                    </form>

                      {r.status !== 'approved' && (
                        <form action="/admin/waitlist/approve" method="POST">
                          <input type="hidden" name="id" value={`${r.id}`} />
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-full border border-green-600 text-xs text-green-300 hover:bg-green-600/20"
                            title="Flip to approved and send invite"
                          >
                            Approve & Email
                          </button>
                        </form>
                      )}

                      <a
                        className="px-3 py-1.5 rounded-full border border-white/10 text-xs hover:bg-white/10"
                        href={`/admin/users?q=${encodeURIComponent(r.email)}`}
                      >
                        View User
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!rows || rows.length === 0) && (
              <tr>
                <td className="p-6 text-center text-gray-400" colSpan={6}>
                  No records{q ? ` for “${q}”` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination base="/admin/waitlist" page={page} q={q} status={status} hasMore={hasMore} total={total} />
    </main>
  );
}

function Pagination({
  base, page, q, status, hasMore, total,
}: {
  base: string;
  page: number;
  q: string;
  status: string;
  hasMore: boolean;
  total: number;
}) {
  const prev = Math.max(1, page - 1);
  const next = page + 1;
  const qsPrev = new URLSearchParams({ page: String(prev), q, status }).toString();
  const qsNext = new URLSearchParams({ page: String(next), q, status }).toString();

  return (
    <div className="flex items-center gap-3 mt-4">
      <a
        className={`px-3 py-2 rounded-full border border-white/10 text-sm ${
          page <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-white/10"
        }`}
        href={`${base}?${qsPrev}`}
        aria-disabled={page <= 1}
      >
        ← Prev
      </a>
      <span className="text-sm">Page {page}{typeof total === "number" ? ` · ${total} total` : ""}</span>
      <a
        className={`px-3 py-2 rounded-full border border-white/10 text-sm ${
          !hasMore ? "opacity-50 pointer-events-none" : "hover:bg-white/10"
        }`}
        href={`${base}?${qsNext}`}
        aria-disabled={!hasMore}
      >
        Next →
      </a>
    </div>
  );
}
