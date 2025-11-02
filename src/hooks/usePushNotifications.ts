'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { useToast } from '@/hooks/use-toast';

export function usePushNotifications(enabled: boolean) {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();

  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!enabled || !('serviceWorker' in navigator) || !session?.user) return;

    const registerAndSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('🛠️ Service worker registered:', registration);

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: 'Permission Denied',
            description: 'Push notifications were not enabled.',
            variant: 'destructive',
          });
          return;
        }

        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          setSubscribed(true);
          return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

        const newSub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });

        // Save to Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .insert({
            user_id: session.user.id,
            subscription: newSub.toJSON(),
            user_agent: navigator.userAgent,
          });

        if (error) {
          toast({ title: 'Error saving subscription', description: error.message, variant: 'destructive' });
        } else {
          setSubscribed(true);
          toast({ title: 'Subscribed', description: 'Push notifications are enabled.' });
        }
      } catch (err) {
        console.error('Push setup error:', err);
        toast({ title: 'Error setting up push', description: String(err), variant: 'destructive' });
      }
    };

    registerAndSubscribe();
  }, [enabled, session]);

  return { subscribed };
}

// Helper: convert VAPID base64 public key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
