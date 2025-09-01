import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Force dynamic (no prerender), keep Node runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as
    | "signup" | "magiclink" | "recovery" | "invite" | "email_change" | null;
  // optional deep-link after auth, defaults to dashboard
  const next = url.searchParams.get("next") || "/dashboard";

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  try {
    // 1) Establish the session (handles OAuth + modern email links)
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    } else if (token_hash && type) {
      // 2) Older OTP-style links (token_hash&type)
      await supabase.auth.verifyOtp({ token_hash, type });
    }
  } catch {
    // ignore; we'll branch below based on session/user
  }

  // If we have a user, decide destination by profile gates
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?e=callback", url));
  }

  // Waitlist check first (use internal service-backed API to avoid RLS issues)
  const email = (user.email || '').toLowerCase().trim();
  if (!email) return NextResponse.redirect(new URL("/login?showWaitlist=1", url));
  // Prefer request origin to avoid env mismatches in dev
  const origin = url.origin;
  try {
    const res = await fetch(`${origin}/api/waitlist/status?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
    if (res.ok) {
      const js = await res.json().catch(() => ({ status: 'unknown' }));
      if (js.status === 'pending') return NextResponse.redirect(new URL(`/no-access?state=pending&email=${encodeURIComponent(email)}`, url));
      if (js.status !== 'approved') return NextResponse.redirect(new URL(`/no-access?state=unknown&email=${encodeURIComponent(email)}`, url));
      // approved → continue to onboarding check below
    } else {
      // If status endpoint fails, fall back to waitlist modal
      return NextResponse.redirect(new URL('/login?showWaitlist=1', url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login?showWaitlist=1', url));
  }

  // Small wait-loop: give the trigger a moment to create the profile row
  // (handles first-signup edge cases)
  let profile: { onboarding_complete: boolean; early_access: boolean } | null = null;
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_complete,early_access")
      .eq("id", user.id)
      .maybeSingle();
    if (data) { profile = data; break; }
    await new Promise(r => setTimeout(r, 150));
  }

  // DO NOT insert a profile here. The DB trigger is the single source of truth.

  let dest = "/dashboard";
  // Approved waitlist: now decide by onboarding completeness
  if (!profile?.onboarding_complete) dest = "/username";

  // Allow an explicit next param to override success path (only allow internal paths)
  if (dest === "/dashboard" && next.startsWith("/")) dest = next;

  return NextResponse.redirect(new URL(dest, url));
}
