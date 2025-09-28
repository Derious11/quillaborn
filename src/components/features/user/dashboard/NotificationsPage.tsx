"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { supabase, user } = useSupabase();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // wait until session is ready

    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id) // explicit filter, RLS would also handle this
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading notifications:", error);
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    }

    loadNotifications();
  }, [user, supabase]);

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
    const data = typeof n.data === "string" ? JSON.parse(n.data) : n.data;

    switch (n.kind) {
      case "project_invite":
        return (
          <div>
            <p className="text-white mb-2">
              📩 <b>{data.inviter_name}</b> has invited you to join{" "}
              <b>{data.project_name}</b>
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => acceptInvite(n.id, data.project_id)}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                Accept
              </Button>
              <Button
                onClick={() =>
                  declineInvite(
                    n.id,
                    data.inviter_id,
                    data.project_id,
                    data.project_name
                  )
                }
                variant="destructive"
              >
                Decline
              </Button>
            </div>
          </div>
        );

      case "invite_declined":
        return (
          <p className="text-white">
            ❌ <b>{data.declined_by_name}</b> declined your invite to join{" "}
            <b>{data.project_name}</b>
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
