// src/lib/profile-gate.ts
import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { supabaseClientOptions } from "./supabaseClientOptions";
import type { Database } from "@/types/database";

export async function getProfileServer() {
  const cookieStore = nextCookies();

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
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null, supabase } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, display_name, username, onboarding_complete, early_access",
    )
    .eq("id", user.id)
    .single();

  return { user, profile, supabase } as const;
}
