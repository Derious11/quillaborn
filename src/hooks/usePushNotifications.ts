"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/hooks/use-toast";

export function usePushNotifications(enabled: boolean) {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);
  const currentUA = typeof window !== "undefined" ? navigator.userAgent : "";

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("serviceWorker" in navigator) || !session?.user) return;

    const setup = async () => {
      try {
        // ✅ Register service worker (only once)
        const registration = await navigator.serviceWorker.register("/service-worker.js");
        console.log("🛠️ Service worker registered:", registration);

        // ✅ Ask for permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast({
            title: "Permission Required",
            description: "Please allow notifications to enable alerts.",
            variant: "destructive",
          });
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
        if (!vapidKey) {
          console.error("❌ Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY env variable");
          return;
        }
        const appServerKey = urlBase64ToUint8Array(vapidKey);

        // ✅ Get or create browser push subscription
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: appServerKey,
          });
        }

        const raw = subscription.toJSON();
        const endpoint = raw?.endpoint;

        if (!endpoint) {
          console.error("❌ Invalid subscription: no endpoint");
          return;
        }

        // ✅ Remove duplicates
        await supabase
          .from("push_subscriptions")
          .delete()
          .match({ user_id: session.user.id, user_agent: currentUA });

        // ✅ Save subscription
        const { error } = await supabase.from("push_subscriptions").insert({
          user_id: session.user.id,
          subscription: raw,
          user_agent: currentUA,
        });

        if (error) throw error;

        setSubscribed(true);
        toast({
          title: "✅ Notifications Enabled",
          description: "This device will now receive alerts.",
        });
      } catch (err: any) {
        console.error("❌ Push setup error:", err);
        toast({
          title: "Push Setup Error",
          description: err instanceof Error ? err.message : String(err),
          variant: "destructive",
        });
      }
    };

    setup();
  }, [enabled, session]);

  // ✅ Manual subscribe trigger (used from SettingsPage)
  const subscribe = async () => {
    if (!session?.user) return;
    const registration = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
    const appServerKey = urlBase64ToUint8Array(vapidKey);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "Permission Required",
          description: "You need to allow notifications.",
          variant: "destructive",
        });
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      });

      const raw = sub.toJSON();

      await supabase.from("push_subscriptions").upsert({
        user_id: session.user.id,
        subscription: raw,
        user_agent: currentUA,
      });

      setSubscribed(true);
      toast({
        title: "Device Subscribed",
        description: "This device is now registered for push alerts.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Subscription Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  // ✅ Manual unsubscribe (browser + Supabase)
  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();

      if (sub) await sub.unsubscribe();

      if (session?.user) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .match({ user_id: session.user.id, user_agent: currentUA });
      }

      setSubscribed(false);
      toast({
        title: "Unsubscribed",
        description: "You will no longer receive push alerts.",
      });
    } catch (err) {
      console.error("❌ Unsubscribe error:", err);
      toast({
        title: "Error Unsubscribing",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  return { subscribed, subscribe, unsubscribe };
}

// Helper
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
