"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useNotifications } from "@/components/providers/NotificationsProvider";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Button } from "@/components/ui/button";

type NotificationRecord = {
  id: string;
  kind: string;
  type: string;
  message: string | null;
  target_url: string | null;
  created_at: string | null;
  read_at: string | null;
  data: unknown;
};

type NotificationWithParsedData = NotificationRecord & {
  data: any;
};

type PostInteractionNotificationData = {
  post_id?: string;
  post_preview?: string;
  interaction_id?: string;
  reaction_type?: string | null;
  liker?: {
    id?: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    avatar_kind?: string;
    avatar_key?: string;
  };
};

type ProjectInviteData = {
  inviter_name?: string;
  inviter_id?: string;
  project_name?: string;
  project_id?: string;
};

type InviteDeclinedData = {
  declined_by_name?: string;
  project_name?: string;
};

export default function NotificationsPage() {
  const { supabase, user } = useSupabase();
  const { setUnreadNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .is("read_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading notifications:", error);
      } else {
        const rows = (data ?? []) as NotificationRecord[];
        setNotifications(rows);
        setUnreadNotifications(
          rows.reduce(
            (acc, row) => (row.read_at ? acc : acc + 1),
            0
          )
        );
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
      setUnreadNotifications((n) => Math.max(0, n - 1));
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
      setUnreadNotifications((n) => Math.max(0, n - 1));
    }
  }

  async function markNotificationRead(notificationId: string) {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error marking notification read:", error);
      return;
    }

    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
    setUnreadNotifications((n) => Math.max(0, n - 1));
  }

  async function clearAllNotifications() {
    if (!user || clearing) return;
    setClearing(true);

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("Error clearing notifications:", error);
      setClearing(false);
      return;
    }

    setNotifications([]);
    setClearing(false);
    setUnreadNotifications(0);
  }

  const parsedNotifications = useMemo<NotificationWithParsedData[]>(
    () =>
      notifications.map((notification) => {
        if (typeof notification.data === "string") {
          try {
            return {
              ...notification,
              data: JSON.parse(notification.data),
            };
          } catch (error) {
            console.error("Failed to parse notification data", {
              notificationId: notification.id,
              error,
            });
            return {
              ...notification,
              data: null,
            };
          }
        }

        return notification as NotificationWithParsedData;
      }),
    [notifications]
  );

  function renderNotification(n: NotificationWithParsedData) {
    const data = n.data ?? {};

    switch (n.kind) {
      case "project_invite": {
        const inviteData = data as ProjectInviteData;
        return (
          <div className="space-y-2">
            <p className="text-white">
              <span className="font-semibold">
                {inviteData.inviter_name ?? "Someone"}
              </span>{" "}
              has invited you to join{" "}
              <span className="font-semibold">
                {inviteData.project_name ?? "their project"}
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  inviteData.project_id
                    ? acceptInvite(n.id, inviteData.project_id)
                    : undefined
                }
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                disabled={!inviteData.project_id}
              >
                Accept
              </Button>
              <Button
                onClick={() =>
                  inviteData.project_id && inviteData.inviter_id
                    ? declineInvite(
                        n.id,
                        inviteData.inviter_id,
                        inviteData.project_id,
                        inviteData.project_name ?? ""
                      )
                    : undefined
                }
                variant="destructive"
                disabled={!inviteData.project_id || !inviteData.inviter_id}
              >
                Decline
              </Button>
            </div>
          </div>
        );
      }

      case "invite_declined": {
        const declinedData = data as InviteDeclinedData;
        return (
          <p className="text-white">
            <span className="font-semibold">
              {declinedData.declined_by_name ?? "A teammate"}
            </span>{" "}
            declined your invite to join{" "}
            <span className="font-semibold">
              {declinedData.project_name ?? "the project"}
            </span>
          </p>
        );
      }

      case "post_like":
      case "post_reaction": {
        const interactionData = data as PostInteractionNotificationData;
        const liker = interactionData.liker ?? {};
        const likerName =
          liker.display_name || liker.username || "Someone";
        const likerProfileUrl = liker.username
          ? `/dashboard/u/${liker.username}`
          : null;
        const postUrl =
          (n.target_url && !n.target_url.includes("/dashboard/posts/"))
            ? n.target_url
            : "/dashboard/profile";
        const isReaction = n.kind === "post_reaction";
        const reactionEmoji =
          isReaction && interactionData.reaction_type
            ? interactionData.reaction_type
            : null;

        return (
          <div className="space-y-2">
            <p className="text-white">
              {likerProfileUrl ? (
                <Link
                  href={likerProfileUrl}
                  className="font-semibold text-green-400 hover:underline"
                >
                  {likerName}
                </Link>
              ) : (
                <span className="font-semibold">{likerName}</span>
              )}{" "}
              {isReaction ? (
                <>
                  reacted
                  {reactionEmoji ? (
                    <>
                      {" "}
                      with{" "}
                      <span className="inline-flex items-center rounded-full bg-gray-800 px-2 py-0.5 text-sm">
                        {reactionEmoji}
                      </span>{" "}
                      on your post
                    </>
                  ) : (
                    " to your post"
                  )}
                </>
              ) : (
                "liked your post"
              )}
            </p>
            {interactionData.post_preview ? (
              <p className="text-gray-400 text-sm line-clamp-2">
                {interactionData.post_preview}
              </p>
            ) : null}
            {postUrl ? (
              <Link
                href={postUrl}
                className="text-sm text-green-400 hover:underline"
              >
                View post
              </Link>
            ) : null}
          </div>
        );
      }

      default:
        return (
          <div className="space-y-1">
            <p className="text-white">{n.message ?? n.kind}</p>
            {n.target_url ? (
              <Link
                href={n.target_url}
                className="text-sm text-pink-400 hover:underline"
              >
                View details
              </Link>
            ) : null}
          </div>
        );
    }
  }

  if (loading) return <p className="text-gray-400">Loading...</p>;

  if (parsedNotifications.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          className="text-sm text-gray-300 hover:text-white"
          onClick={clearAllNotifications}
          disabled={clearing}
        >
          {clearing ? "Clearing..." : "Clear all"}
        </Button>
      </div>
      {parsedNotifications.map((n) => (
        <div
          key={n.id}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">{renderNotification(n)}</div>
            <Button
              variant="ghost"
              className="text-xs text-gray-400 hover:text-white"
              onClick={() => markNotificationRead(n.id)}
            >
              Mark read
            </Button>
          </div>
          <span className="text-gray-500 text-sm block">
            {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
