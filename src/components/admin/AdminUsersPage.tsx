'use client';

import { useState } from "react";
import Image from "next/image";
import AwardBadgeForm from "@/app/admin/users/AwardBadgeForm";
import SendPushNotificationModal from "@/components/admin/SendPushNotificationModal";
import { Button } from "@/components/ui/button";

type Props = {
  q: string;
  page: number;
  pageSize: number;
  rows: any[];
  badges: any[];
  badgeMap: Record<string, any[]>;
};

export default function AdminUsersPage({ q, page, pageSize, rows, badges, badgeMap }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-extrabold">Admin · Users</h1>
        <div className="flex gap-2">
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
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setModalOpen(true)}>
            Send Notification
          </Button>
        </div>
      </div>

      <SendPushNotificationModal open={modalOpen} onClose={() => setModalOpen(false)} />

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
              <th className="p-3 text-left">Badges</th>
              <th className="p-3 text-left">Award Badge</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r: any) => (
              <tr key={r.user_id} className="border-t border-white/5 align-top">
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
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {(badgeMap[r.user_id] ?? []).map((b) => (
                      <div key={b.id} className="flex items-center gap-1">
                        {b.icon_url && (
                          <Image
                            src={b.icon_url}
                            alt={b.name}
                            width={20}
                            height={20}
                            loading="eager"
                            className="rounded-full border border-gray-400"
                          />
                        )}
                        <span className="text-xs text-gray-300">{b.name}</span>
                      </div>
                    ))}
                    {(badgeMap[r.user_id]?.length ?? 0) === 0 && (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <AwardBadgeForm userId={r.user_id} badges={badges} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} q={q} hasMore={(rows?.length ?? 0) === pageSize} />
    </>
  );
}

function Pagination({
  page,
  q,
  hasMore,
}: {
  page: number;
  q: string;
  hasMore: boolean;
}) {
  const prev = Math.max(1, page - 1);
  const next = page + 1;
  return (
    <div className="flex items-center gap-3 mt-4">
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
