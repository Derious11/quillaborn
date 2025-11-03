// src/app/api/waitlist/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Database } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  global: {
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
  },
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Waitlist API: missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const rawName = typeof body?.name === "string" ? body.name : "";
    const email = rawEmail.trim().toLowerCase();
    const name = rawName.trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("waitlist")
      .upsert(
        [
          {
            email,
            status: "pending",
            name: name || null,
            notes: name
              ? `Submitted via website waitlist form (name: ${name})`
              : "Submitted via website waitlist form",
          },
        ],
        { onConflict: "email_norm" },
      );

    if (error) {
      console.error("Waitlist upsert error:", error);
      return NextResponse.json(
        { error: "Failed to add to waitlist" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "You’re on the list. Use this same email to sign up for instant access.",
    });
  } catch (err) {
    console.error("Waitlist API unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
