// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import HomePage, { type CreativePulse } from "@/components/features/user/dashboard/HomePage";
import type { Profile } from "@/lib/types";

type ProfilePostRow = {
  id: string;
  body: string;
  created_at: string;
  author_user_id: string;
  profile_user_id: string;
  like_count: number;
  comment_count: number;
  reaction_count: number;
};

type AuthorProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_key: string | null;
  avatar_url: string | null;
  avatar_kind: string | null;
};

function normalizeAvatarKind(kind: string | null): Profile["avatar_kind"] {
  return kind === "none" || kind === "preset" || kind === "upload" ? kind : null;
}

function calculateCreativeStreak(posts: { created_at: string }[]): number {
  if (!posts.length) return 0;
  const uniqueDates = Array.from(new Set(posts.map((p) => p.created_at.split("T")[0])));
  uniqueDates.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

  let streak = 0;
  let prev: Date | null = null;

  for (const d of uniqueDates) {
    const cur = new Date(`${d}T00:00:00Z`);
    if (!prev) {
      streak = 1;
      prev = cur;
      continue;
    }
    const diff = Math.round((prev.getTime() - cur.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      prev = cur;
    } else break;
  }

  return streak;
}

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // --- Profile ---------------------------------------------------
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile || !profile.onboarding_complete) redirect("/username");

  // --- Interests -------------------------------------------------
  const { data: userInterests } = await supabase
    .from("profile_interests")
    .select(`interest_id, interests ( id, name )`)
    .eq("profile_id", user.id);

  // --- Role ------------------------------------------------------
  const { data: userRole } = await supabase
    .from("profile_roles")
    .select(`role_id, roles ( id, name )`)
    .eq("profile_id", user.id)
    .single();

  // --- Projects count --------------------------------------------
  const { data: projectIdRows } = await supabase.rpc("get_user_project_ids", {
    p_user: user.id,
  });
  const projectsCount = Array.isArray(projectIdRows)
    ? projectIdRows.length
    : 0;

  // --- Post count -----------------------------------------------
  const { count: postsCount } = await supabase
    .from("profile_posts")
    .select("id", { count: "exact", head: true })
    .eq("profile_user_id", user.id);

  // --- Followers count ------------------------------------------
  const { data: followerCounts } = await supabase
    .from("profile_follow_counts")
    .select("follower_count")
    .eq("profile_id", user.id)
    .maybeSingle();

  // --- Creative streak ------------------------------------------
  const { data: streakSource } = await supabase
    .from("profile_posts")
    .select("created_at")
    .eq("profile_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const creativeStreakDays = calculateCreativeStreak(streakSource ?? []);

  // --- Community feed -------------------------------------------
  const { data: rawCommunityPosts, error } = await supabase
    .from("profile_posts")
    .select(`
      id,
      body,
      created_at,
      author_user_id,
      profile_user_id,
      like_count,
      comment_count,
      reaction_count
    `)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) console.error("Feed query error:", error);

  // Filter out the user's own posts and limit to 6 for feed
  const filteredPosts =
    (rawCommunityPosts || []).filter((p) => p.author_user_id !== user.id) ?? [];
  const feedPosts: ProfilePostRow[] =
    (filteredPosts.length ? filteredPosts : rawCommunityPosts || []).slice(0, 6);

  // --- Author profiles ------------------------------------------
  const authorIds = Array.from(new Set(feedPosts.map((p) => p.author_user_id)));
  const { data: authorProfiles } = authorIds.length
    ? await supabase
        .from("profiles")
        .select(
          "id, display_name, username, avatar_key, avatar_url, avatar_kind"
        )
        .in("id", authorIds)
    : { data: [] as AuthorProfile[] };

  const authorById = new Map(
    ((authorProfiles ?? []) as AuthorProfile[]).map((profileRow) => [
      profileRow.id,
      profileRow,
    ]),
  );

  // --- Combine posts + authors ----------------------------------
  const creativePulses: CreativePulse[] = feedPosts.map((post) => {
    const author = authorById.get(post.author_user_id);
    return {
      ...post,
      author: author
        ? {
            id: author.id,
            display_name: author.display_name,
            username: author.username ?? "",
            avatar_key: author.avatar_key,
            avatar_url: author.avatar_url,
            avatar_kind: normalizeAvatarKind(author.avatar_kind),
          }
        : null,
    };
  });

  // --- Render HomePage ------------------------------------------
  return (
    <HomePage
      user={user}
      profile={profile}
      userInterests={userInterests || []}
      userRole={userRole}
      stats={{
        creativeStreakDays,
        projectsCount,
        postsCount: postsCount ?? 0,
        followersCount: followerCounts?.follower_count ?? 0,
      }}
      creativePulses={creativePulses}
    />
  );
}
