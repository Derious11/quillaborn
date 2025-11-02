// src/app/api/admin/send-notification/route.ts

export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import webpush from "web-push";

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

  if (subError || !subs || subs.length === 0) {
    return NextResponse.json({ error: "No subscriptions found" }, { status: 404 });
  }

  const payload = JSON.stringify({ title, body: message, url });

  // Send push
  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(s.subscription, payload).catch((err: unknown) => err)
    )
  );

  const successCount = results.filter(r => r.status === "fulfilled").length;
  const failedCount = results.length - successCount;

  return NextResponse.json({
    message: `Sent to ${successCount} users. ${failedCount} failed.`,
  });
}
