// src/app/dashboard/page.tsx

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import HomePage, { type CreativePulse } from '@/components/features/user/dashboard/HomePage';
import type { Profile} from '@/lib/types';

type ProfilePostRow = {
  id: string;
  body: string;
  created_at: string;
  author_user_id: string;
  profile_user_id: string;
};

function calculateCreativeStreak(posts: { created_at: string }[]): number {
  if (!posts.length) return 0;

  const uniqueDates = Array.from(
    new Set(posts.map((post) => post.created_at.split('T')[0]))
  );

  uniqueDates.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

  let streak = 0;
  let previousDate: Date | null = null;

  for (const dateString of uniqueDates) {
    const currentDate = new Date(`${dateString}T00:00:00Z`);

    if (!previousDate) {
      streak = 1;
      previousDate = currentDate;
      continue;
    }

    const diffInDays = Math.round((previousDate.getTime() - currentDate.getTime()) / 86400000);

    if (diffInDays === 1) {
      streak += 1;
      previousDate = currentDate;
    } else {
      break;
    }
  }

  return streak;
}

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's profile with interests and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  // Check if profile exists and onboarding is complete
  if (!profile) {
    // If no profile exists, redirect to onboarding
    redirect('/username');
  }

  if (!profile.onboarding_complete) {
    // If onboarding is not complete, redirect to onboarding
    redirect('/username');
  }

  // Fetch user's interests
  const { data: userInterests } = await supabase
    .from('profile_interests')
    .select(`
      interest_id,
      interests (
        id,
        name
      )
    `)
    .eq('profile_id', user.id);

  // Fetch user's role
  const { data: userRole } = await supabase
    .from('profile_roles')
    .select(`
      role_id,
      roles (
        id,
        name
      )
    `)
    .eq('profile_id', user.id)
    .single();

      const { data: projectIdRows } = await supabase.rpc('get_user_project_ids', {
    p_user: user.id,
  });

  const projectsCount = Array.isArray(projectIdRows) ? projectIdRows.length : 0;

  const { count: postsCount } = await supabase
    .from('profile_posts')
    .select('id', { count: 'exact', head: true })
    .eq('profile_user_id', user.id);

  const { data: followerCounts } = await supabase
    .from('profile_follow_counts')
    .select('follower_count')
    .eq('profile_id', user.id)
    .maybeSingle();

  const { data: streakSource } = await supabase
    .from('profile_posts')
    .select('created_at')
    .eq('profile_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  const creativeStreakDays = calculateCreativeStreak(streakSource ?? []);

  const { data: rawCommunityPosts } = await supabase
    .from('profile_posts')
    .select('id, body, created_at, author_user_id, profile_user_id')
    .order('created_at', { ascending: false })
    .limit(12);

  const filteredPosts = (rawCommunityPosts || []).filter((post) => post.author_user_id !== user.id);
  const feedPosts: ProfilePostRow[] = (filteredPosts.length ? filteredPosts : rawCommunityPosts || []).slice(0, 6);

  const authorIds = Array.from(new Set(feedPosts.map((post) => post.author_user_id)));

  const { data: authorProfiles } = authorIds.length
    ? await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_key, avatar_url, avatar_kind')
      .in('id', authorIds)
    : { data: [] };

  const creativePulses: CreativePulse[] = feedPosts.map(({ profile_user_id: _profileId, ...post }) => ({
    ...post,
    author: (authorProfiles || []).find((profileRow) => profileRow.id === post.author_user_id) ?? null,
  }));

  // Show the dashboard only if onboarding is complete
  return <HomePage 
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
  />;
}
