// src/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { supabaseClientOptions } from "@/lib/supabaseClientOptions";
import type { Database } from "@/types/database";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...supabaseClientOptions,
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: "", ...options });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const email = (user.email || "").toLowerCase().trim();
  if (!email) {
    return NextResponse.redirect(new URL("/no-access?state=unknown", req.url));
  }

  const { data: wl } = await supabase
    .from("waitlist")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (wl?.status === "approved") {
    return res;
  }
  if (wl?.status === "pending") {
    return NextResponse.redirect(new URL("/no-access?state=pending", req.url));
  }
  return NextResponse.redirect(new URL("/no-access?state=unknown", req.url));
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
