/* global self, clients */

self.addEventListener("install", (event) => {
  console.log("📦 Service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("🚀 Service worker activated");
  event.waitUntil(self.clients.claim());
});

// 🔔 Handle incoming push notifications
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    console.warn("⚠️ Invalid push payload, defaulting to empty:", err);
  }

  const title = data.title || "New Notification";
  const options = {
    body: data.body || "",
    icon: data.icon || "/logo-192.png",
    badge: data.badge || "/badge-72.png",
    image: data.image || undefined,
    data: {
      url: data.url || "/",
    },
  };

  console.log("📨 Push received:", data);

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 👆 Handle clicks on notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  console.log("🔗 Notification clicked, navigating to:", url);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// 💤 Optionally listen for pushsubscriptionchange (token rotation)
self.addEventListener("pushsubscriptionchange", async (event) => {
  console.log("♻️ Push subscription changed, re-subscribing...");
  const applicationServerKey = urlBase64ToUint8Array(
    (await self.registration.pushManager.getSubscription())?.options.applicationServerKey ||
      self.VAPID_PUBLIC_KEY
  );
  const newSub = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
  console.log("🔁 New push subscription:", newSub);
});

// Utility to decode base64 public key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
