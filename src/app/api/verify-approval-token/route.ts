import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url0 = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key0 = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(url0, key0, {
    auth: { persistSession: false },
    global: { headers: { apikey: key0, Authorization: `Bearer ${key0}` } },
  });
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || "").toLowerCase().trim();
  const token = (url.searchParams.get("token") || "").trim();

  if (!email || !token) {
    return NextResponse.json(
      { ok: false, error: "Missing email or token" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("waitlist_approval_tokens")
    .select("id, used_at, email")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 });
  }
  if ((data.email || "").toLowerCase().trim() !== email) {
    return NextResponse.json(
      { ok: false, error: "Token/email mismatch" },
      { status: 400 },
    );
  }

  if (data.used_at) {
    return NextResponse.json({ ok: false, error: "Token already used" }, { status: 400 });
  }

  await supabase
    .from("waitlist_approval_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", data.id);

  return NextResponse.json({ ok: true });
}
