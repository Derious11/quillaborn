// src/app/api/admin/send-notification/route.ts

export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import webpush, { type PushSubscription } from "web-push";

// Setup VAPID
webpush.setVapidDetails(
  "mailto:you@yourdomain.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const body = await req.json();
  const { title, body: message, url = "/" } = body;

  // Get session user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "owner"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch subscriptions
  const { data: subs, error: subError } = await supabase
    .from("push_subscriptions")
    .select("subscription");

  if (subError || !Array.isArray(subs) || subs.length === 0) {
    return NextResponse.json({ error: "No subscriptions found" }, { status: 404 });
  }

  const payload = JSON.stringify({ title, body: message, url });

  const subscriptions = (subs ?? []).flatMap((row) => {
    const subscription = row.subscription;
    return isPushSubscription(subscription) ? [subscription] : [];
  });

  if (subscriptions.length === 0) {
    return NextResponse.json({ error: "No valid subscriptions found" }, { status: 404 });
  }

  // Send push
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(subscription, payload).catch((err: unknown) => err)
    )
  );

  const successCount = results.filter(r => r.status === "fulfilled").length;
  const failedCount = results.length - successCount;

  return NextResponse.json({
    message: `Sent to ${successCount} users. ${failedCount} failed.`,
  });
}

function isPushSubscription(candidate: unknown): candidate is PushSubscription {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return false;
  }

  const maybe = candidate as {
    endpoint?: unknown;
    keys?: unknown;
  };

  if (typeof maybe.endpoint !== "string") return false;
  if (!maybe.keys || typeof maybe.keys !== "object" || Array.isArray(maybe.keys)) return false;

  const keys = maybe.keys as { p256dh?: unknown; auth?: unknown };

  return typeof keys.p256dh === "string" && typeof keys.auth === "string";
}
