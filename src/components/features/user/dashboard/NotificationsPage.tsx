"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading notifications:", error);
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    }

    loadNotifications();
  }, []);

  async function acceptInvite(notificationId: string, projectId: string) {
    const res = await fetch("/api/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId, projectId }),
    });

    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }
  }

  async function declineInvite(
    notificationId: string,
    inviterId: string,
    projectId: string,
    projectName: string
  ) {
    const res = await fetch("/api/invites/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationId,
        inviterId,
        projectId,
        projectName,
      }),
    });

    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }
  }

  function renderNotification(n: any) {
    switch (n.kind) {
      case "project_invite":
        return (
          <div>
            <p className="text-white mb-2">
              📩 <b>{n.data.inviter_name}</b> has invited you to join{" "}
              <b>{n.data.project_name}</b>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => acceptInvite(n.id, n.data.project_id)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Accept
              </button>
              <button
                onClick={() =>
                  declineInvite(
                    n.id,
                    n.data.inviter_id,
                    n.data.project_id,
                    n.data.project_name
                  )
                }
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Decline
              </button>
            </div>
          </div>
        );

      case "invite_declined":
        return (
          <p className="text-white">
            ❌ <b>{n.data.declined_by_name}</b> declined your invite to join{" "}
            <b>{n.data.project_name}</b>
          </p>
        );

      default:
        return <p className="text-white">{n.kind}</p>;
    }
  }

  if (loading) return <p className="text-gray-400">Loading...</p>;

  if (notifications.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          {renderNotification(n)}
          <span className="text-gray-500 text-sm block">
            {new Date(n.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
