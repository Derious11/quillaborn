"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type Ctx = {
  unreadMessages: number;
  setUnreadMessages: Dispatch<SetStateAction<number>>;
  unreadNotifications: number;
  setUnreadNotifications: Dispatch<SetStateAction<number>>;
};

const NotificationsCtx = createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { supabase, user } = useSupabase();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Initial count + realtime (works anywhere in dashboard)
  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      setUnreadNotifications(0);
      return;
    }

    let mounted = true;

    // initial unread count
    (async () => {
      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .is("read_at", null);
      if (!error && mounted) setUnreadMessages(count ?? 0);
    })();

    // realtime: increment on new inbound; decrement when a message to me gets marked read
    const channel = supabase
      .channel("notif:messages:" + user.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        () => setUnreadMessages((n) => n + 1)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        (payload: any) => {
          const readAt = payload.new?.read_at;
          if (readAt) setUnreadMessages((n) => Math.max(0, n - 1));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id]);

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }

    let mounted = true;

    (async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null);
      if (!error && mounted) setUnreadNotifications(count ?? 0);
    })();

    const channel = supabase
      .channel("notif:notifications:" + user.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => setUnreadNotifications((n) => n + 1)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const wasUnread = !payload.old?.read_at;
          const nowUnread = !payload.new?.read_at;

          if (wasUnread && !nowUnread) {
            setUnreadNotifications((n) => Math.max(0, n - 1));
          } else if (!wasUnread && nowUnread) {
            setUnreadNotifications((n) => n + 1);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id]);

  return (
    <NotificationsCtx.Provider
      value={{
        unreadMessages,
        setUnreadMessages,
        unreadNotifications,
        setUnreadNotifications,
      }}
    >
      {children}
    </NotificationsCtx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsCtx);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
