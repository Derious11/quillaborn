// src/app/api/waitlist/status/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw = (url.searchParams.get("email") || "").toLowerCase().trim();
  if (!raw)
    return NextResponse.json({ error: "email required" }, { status: 400 });

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supaUrl, srvKey, {
    auth: { persistSession: false },
    global: { headers: { apikey: srvKey, Authorization: `Bearer ${srvKey}` } },
  });

  let status: string | null = null;
  let { data, error } = await supabase
    .from("waitlist")
    .select("status")
    .eq("email_norm", raw)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.status) {
    status = data.status;
  } else {
    const fallback = await supabase
      .from("waitlist")
      .select("status")
      .eq("email", raw)
      .maybeSingle();
    if (!fallback.error && fallback.data?.status) status = fallback.data.status;
  }

  return NextResponse.json({ status: (status ?? "unknown").toLowerCase() });
}
