import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProfileCard from '@/components/features/explore/ProfileCard';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { Avatar } from '@/components/ui/avatar';

export default async function FollowingPage({ params: { username } }: { params: { username: string } }) {
  const sb = createSupabaseServerClient();

  // Who we're viewing (include avatar fields for header)
  const { data: profile, error: profileErr } = await sb
    .from('user_profiles_public')
    .select(`
      id,
      username,
      display_name,
      bio,
      avatar_kind,
      avatar_key,
      avatar_path,
      avatar_url
    `)
    .eq('username', username)
    .maybeSingle();

  if (profileErr) console.error(profileErr);
  if (!profile) return notFound();

  // Counts for header
  const { data: counts, error: countsErr } = await sb
    .from('profile_follow_counts')
    .select('follower_count, following_count')
    .eq('profile_id', profile.id)
    .maybeSingle();
  if (countsErr) console.error(countsErr);

  // Following (who this user follows)
  const { data: rows, error: rowsErr } = await sb.rpc('get_following', {
    p_user_id: profile.id,
    p_limit: 200,
    p_offset: 0,
  });
  if (rowsErr) console.error(rowsErr);

  const ids: string[] = (rows ?? [])
    .map((r: any) => r.followed_id as string)
    .filter((v: string | undefined): v is string => !!v);

  // Fetch followed profiles and rebuild list in RPC order
  let people: any[] = [];
  if (ids.length) {
    const { data, error } = await sb
      .from('user_profiles_public')
      .select(`
        id,
        username,
        display_name,
        bio,
        avatar_kind,
        avatar_key,
        avatar_path,
        avatar_url,
        roles,
        interests
      `)
      .in('id', ids);
    if (error) console.error(error);

    const byId = new Map<string, any>();
    (data ?? []).forEach((p: any) => { if (p?.id) byId.set(p.id as string, p); });

    const ordered: any[] = [];
    for (const id of ids) {
      const item = byId.get(id);
      if (item) ordered.push(item);
    }
    people = ordered;
  }

  const name = profile.display_name || profile.username || 'Profile';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <Link href={`/dashboard/u/${username}`} className="text-sm hover:underline">← Back to profile</Link>

      {/* Header: who we're viewing */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <div className="flex items-center gap-4">
          <Avatar profile={profile as any} alt={name} size={16} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold truncate">{name}</h1>
              {profile.username && <span className="text-sm text-gray-400 truncate">@{profile.username}</span>}
            </div>
            <div className="mt-1 text-sm text-gray-300 flex items-center gap-3">
              <span><span className="font-semibold">{Number(counts?.follower_count ?? 0)}</span> Followers</span>
              <span className="opacity-50">•</span>
              <span><span className="font-semibold">{Number(counts?.following_count ?? 0)}</span> Following</span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-gray-400 text-sm">Accounts followed by {name}</div>
      </div>

      {/* List */}
      {people.length === 0 ? (
        <p className="text-gray-400">Not following anyone yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {people.map((p) => (
            <ProfileCard key={p.id} profile={p} inDashboard />
          ))}
        </div>
      )}
    </div>
  );
}
