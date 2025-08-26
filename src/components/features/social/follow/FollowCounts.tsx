import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function FollowCounts({
  profileId,
  username
}: { profileId: string; username: string | null }) {
  const supabase = createSupabaseServerClient();

  const { data: counts } = await supabase
    .from('profile_follow_counts')
    .select('follower_count, following_count')
    .eq('profile_id', profileId)
    .maybeSingle();

  const followerCount = counts?.follower_count ?? 0;
  const followingCount = counts?.following_count ?? 0;

  const base = `/dashboard/u/${username ?? ''}`;
  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href={`${base}/followers`} className="hover:underline">
        <span className="font-semibold">{followerCount}</span> Followers
      </Link>
      <Link href={`${base}/following`} className="hover:underline">
        <span className="font-semibold">{followingCount}</span> Following
      </Link>
    </div>
  );
}
