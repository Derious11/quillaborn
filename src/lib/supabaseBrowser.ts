// src/lib/supabaseBrowser.ts

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseClientOptions } from "./supabaseClientOptions";
import type { Database } from "@/types/database";

export type BrowserSupabaseClient = SupabaseClient<Database>;

let client: BrowserSupabaseClient | null = null;

export function createSupabaseBrowserClient(): BrowserSupabaseClient {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      supabaseClientOptions,
    );
  }

  return client;
}
