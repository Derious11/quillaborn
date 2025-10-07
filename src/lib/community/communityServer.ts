import { createSupabaseServerClient } from "@/lib/supabaseServer";

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

/**
 * ✅ getCommunityData
 * Fetch categories + threads for SSR use in /dashboard/community
 */
export async function getCommunityData(categorySlug?: string) {
  const supabase = createSupabaseServerClient();

  // Fetch all categories
  const { data: categories, error: catErr } = await supabase
    .from("community_categories")
    .select("*")
    .order("position");

  if (catErr) {
    console.error("Error fetching community categories:", catErr.message);
    throw catErr;
  }

  let threadsQuery = supabase
    .from("community_threads")
    .select(
      `
      id, title, body_md, created_at, updated_at, likes, category_id, user_id,
      profiles ( id, display_name, username, avatar_key )
    `
    )
    .order("created_at", { ascending: false });

  if (categorySlug && categories?.length) {
    const category = categories.find((c) => c.slug === categorySlug);
    if (category) threadsQuery = threadsQuery.eq("category_id", category.id);
  }

  const { data: threads, error: threadErr } = await threadsQuery;

  if (threadErr) {
    console.error("Error fetching community threads:", threadErr.message);
    throw threadErr;
  }

  return {
    categories: categories || [],
    threads: threads || [],
  };
}

/**
 * ✅ getThreadWithComments
 * For single-thread pages (/dashboard/community/[id])
 */
export async function getThreadWithComments(threadId: string) {
  const supabase = createSupabaseServerClient();

  const { data: thread, error: threadErr } = await supabase
    .from("community_threads")
    .select(
      `
      id, title, body_md, created_at, updated_at, likes, category_id, user_id,
      profiles ( id, display_name, username, avatar_key )
    `
    )
    .eq("id", threadId)
    .single();

  if (threadErr) {
    console.error("Error fetching thread:", threadErr.message);
    throw threadErr;
  }

  const { data: comments, error: commentErr } = await supabase
    .from("community_comments")
    .select(
      `
      id, thread_id, user_id, parent_id, body_md, created_at,
      profiles ( id, display_name, username, avatar_key )
    `
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (commentErr) {
    console.error("Error fetching comments:", commentErr.message);
    throw commentErr;
  }

  return { thread, comments: comments || [] };
}
