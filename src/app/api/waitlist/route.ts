// src/app/api/waitlist/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Ensure this route runs on Node (not Edge) since it uses the service-role key
export const runtime = "nodejs";
// Optional: avoid caching of responses
export const dynamic = "force-dynamic";

// --- Supabase (server) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Basic email validation (keep simple to avoid false negatives)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    // Guard env
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Waitlist API: missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Parse & normalize
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    // Validate
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Idempotent upsert:
    // - Requires DB migration that adds:
    //   email_norm GENERATED ALWAYS AS (lower(btrim(email))) STORED
    //   and UNIQUE INDEX on (email_norm)
    // - We conflict on 'email_norm' to make uniqueness case-insensitive.
    const { error } = await supabase
      .from("waitlist")
      .upsert(
        [
          {
            email, // normalized
            status: "pending",
            notes: "Submitted via website waitlist form",
          },
        ],
        { onConflict: "email_norm" }
      );

    if (error) {
      // Do NOT echo DB details to the client
      console.error("Waitlist upsert error:", error);
      return NextResponse.json(
        { error: "Failed to add to waitlist" },
        { status: 500 }
      );
    }

    // Friendly success even if the email already existed (prevents enumeration)
    return NextResponse.json({
      success: true,
      message:
        "You’re on the list. Use this same email to sign up for instant access.",
    });
  } catch (err) {
    console.error("Waitlist API unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
