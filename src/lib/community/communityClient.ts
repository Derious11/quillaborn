"use client";

import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useEffect, useState, useCallback } from "react";

/* -----------------------------
   TYPES
----------------------------- */

export interface CommunityCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
}

export interface CommunityThread {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  body_md: string;
  created_at: string;
  updated_at: string;
  likes: number;
  profiles?: {
    id: string;
    display_name: string | null;
    username: string;
    avatar_key?: string;
  };
}

export interface CommunityComment {
  id: string;
  thread_id: string;
  user_id: string;
  parent_id?: string | null;
  body_md: string;
  created_at: string;
  profiles?: {
    id: string;
    display_name: string | null;
    username: string;
    avatar_key?: string;
  };
}

/* -----------------------------
   HOOK: useCommunityData
   Fetches categories + threads (optionally filtered)
----------------------------- */

export function useCommunityData(categorySlug?: string) {
  const { supabase } = useSupabase();
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Unified fetcher (reusable and callable manually)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ---- Fetch Categories ----
      const { data: cats, error: catErr } = await supabase
        .from("community_categories")
        .select("*")
        .order("position");

      if (catErr) throw catErr;

      if (!cats || cats.length === 0) {
        console.warn("[Community] No categories found");
        setCategories([]);
      } else {
        setCategories(cats);
      }

      // ---- Fetch Threads ----
      let query = supabase
        .from("community_threads")
        .select(
          `
          id, title, body_md, created_at, updated_at, likes, category_id, user_id,
          profiles ( id, display_name, username, avatar_key )
        `
        )
        .order("created_at", { ascending: false });

      if (categorySlug && cats?.length) {
        const category = cats.find((c) => c.slug === categorySlug);
        if (category) query = query.eq("category_id", category.id);
      }

      const { data: ths, error: thErr } = await query;
      if (thErr) throw thErr;

      const normalized = (ths || []).map((t: any) => ({
        ...t,
        profiles: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles,
      }));

      setThreads(normalized);
    } catch (err: any) {
      console.error("[Community] Fetch error:", err.message || err);
      setError(err.message || "Failed to load community data");
    } finally {
      setLoading(false);
    }
  }, [supabase, categorySlug]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Optional: realtime subscription for new threads
  useEffect(() => {
    const channel = supabase
      .channel("community-threads")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_threads" },
        (payload) => {
          setThreads((prev) => {
            const existing = prev.find((t) => t.id === payload.new.id);
            if (existing) return prev;
            return [payload.new as any, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { categories, threads, loading, error, reload: fetchData };
}

/* -----------------------------
   ACTIONS
----------------------------- */

/** ✅ Create a new thread */
export async function createThread(
  supabase: any,
  userId: string,
  categoryId: string,
  title: string,
  body_md: string
) {
  const { error } = await supabase.from("community_threads").insert({
    user_id: userId,
    category_id: categoryId,
    title,
    body_md,
  });
  if (error) throw error;
}

/** ✅ Create a new comment */
export async function createComment(
  supabase: any,
  userId: string,
  threadId: string,
  body_md: string,
  parentId?: string
) {
  const { error } = await supabase.from("community_comments").insert({
    user_id: userId,
    thread_id: threadId,
    body_md,
    parent_id: parentId ?? null,
  });
  if (error) throw error;
}

/** ✅ Fetch comments for a thread */
export async function fetchComments(supabase: any, threadId: string) {
  const { data, error } = await supabase
    .from("community_comments")
    .select(
      `
      id, thread_id, user_id, parent_id, body_md, created_at,
      profiles ( id, display_name, username, avatar_key )
    `
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}
