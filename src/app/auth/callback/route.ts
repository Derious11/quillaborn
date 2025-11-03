import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { supabaseClientOptions } from "@/lib/supabaseClientOptions";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as
    | "signup"
    | "magiclink"
    | "recovery"
    | "invite"
    | "email_change"
    | null;
  const next = url.searchParams.get("next") || "/dashboard";

  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...supabaseClientOptions,
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    },
  );

  try {
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    } else if (token_hash && type) {
      await supabase.auth.verifyOtp({ token_hash, type });
    }
  } catch {
    // ignore; branch on session state below
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?e=callback", url));
  }

  const email = (user.email || "").toLowerCase().trim();
  if (!email)
    return NextResponse.redirect(new URL("/login?showWaitlist=1", url));
  const origin = url.origin;
  try {
    const res = await fetch(
      `${origin}/api/waitlist/status?email=${encodeURIComponent(email)}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const js = await res.json().catch(() => ({ status: "unknown" }));
      if (js.status === "pending")
        return NextResponse.redirect(
          new URL(
            `/no-access?state=pending&email=${encodeURIComponent(email)}`,
            url,
          ),
        );
      if (js.status !== "approved")
        return NextResponse.redirect(
          new URL(
            `/no-access?state=unknown&email=${encodeURIComponent(email)}`,
            url,
          ),
        );
    } else {
      return NextResponse.redirect(new URL("/login?showWaitlist=1", url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login?showWaitlist=1", url));
  }

  let profile: {
    onboarding_complete: boolean;
    early_access: boolean;
  } | null = null;
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_complete,early_access")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      profile = {
        onboarding_complete: Boolean(data.onboarding_complete),
        early_access: Boolean(data.early_access),
      };
      break;
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  let dest = "/dashboard";
  if (!profile?.onboarding_complete) dest = "/username";
  if (dest === "/dashboard" && next.startsWith("/")) dest = next;

  return NextResponse.redirect(new URL(dest, url));
}
