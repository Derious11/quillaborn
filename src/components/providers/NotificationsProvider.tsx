"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type Ctx = {
  unreadMessages: number;
  setUnreadMessages: (n: number) => void; // exposed in case you ever want manual overrides
};

const NotificationsCtx = createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { supabase, user } = useSupabase();
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Initial count + realtime (works anywhere in dashboard)
  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
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

  return (
    <NotificationsCtx.Provider value={{ unreadMessages, setUnreadMessages }}>
      {children}
    </NotificationsCtx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsCtx);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
