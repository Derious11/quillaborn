"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useToast } from "@/hooks/use-toast";

export function usePushNotifications(enabled: boolean) {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!enabled || !("serviceWorker" in navigator) || !session?.user) return;

    const registerAndSubscribe = async () => {
      try {
        // ✅ Register service worker
        const registration = await navigator.serviceWorker.register("/service-worker.js");
        console.log("🛠️ Service worker registered:", registration);

        // ✅ Ask permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast({
            title: "Permission Required",
            description: "Push notifications are disabled.",
            variant: "destructive",
          });
          return;
        }

        // ✅ Check if already subscribed
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          console.log("📬 Already subscribed:", existing);
          setSubscribed(true);
          return;
        }

        // ✅ Convert VAPID Key
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
        if (!vapidKey) {
          console.error("❌ Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY env variable");
          return;
        }

        const appServerKey = urlBase64ToUint8Array(vapidKey);

        // ✅ Subscribe
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey,
        });

        const raw = subscription.toJSON?.();
        console.log("📬 Raw subscription object:", raw);

        // ✅ Validate keys
        if (
          !raw ||
          !raw.keys ||
          typeof raw.keys.p256dh !== "string" ||
          typeof raw.keys.auth !== "string"
        ) {
          console.error("❌ Invalid push subscription:", raw);
          toast({
            title: "Push Failure",
            description: "Subscription did not include valid keys.",
            variant: "destructive",
          });
          return;
        }

        // ✅ Store subscription
        const { error } = await supabase
          .from("push_subscriptions")
          .insert({
            user_id: session.user.id,
            subscription: raw,
            user_agent: navigator.userAgent,
          });

        if (error) {
          console.error("❌ Error storing subscription:", error);
          toast({
            title: "Subscription Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setSubscribed(true);
        toast({
          title: "✅ Notifications Enabled",
          description: "You will now receive updates from Quillaborn.",
        });

      } catch (err) {
        console.error("❌ Push setup error:", err);
        toast({
          title: "Push Error",
          description: err instanceof Error ? err.message : String(err),
          variant: "destructive",
        });
      }
    };

    registerAndSubscribe();
  }, [enabled, session]);

  return { subscribed };
}

// ✅ VAPID key conversion
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
