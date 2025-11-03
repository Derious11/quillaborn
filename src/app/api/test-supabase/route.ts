import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export async function GET() {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json({
        error: "Missing environment variables",
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      },
    });

    const { data, error } = await supabase
      .from("waitlist")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json({
        error: "Database connection failed",
        details: error.message,
        code: error.code,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      tableExists: !!data?.length,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      error: "Test failed",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
