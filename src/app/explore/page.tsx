import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function ExplorePage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookies() }
  );

  const { data, error } = await supabase.rpc('get_public_profiles');
  if (error) throw error;

  const profiles = (data || []) as any[];

  return (
    <div className="max-w-5xl mx-auto py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((p) => (
        <div key={p.id} className="rounded-2xl border p-4">
          {/* avatar */}
          <div className="h-16 w-16 rounded-full overflow-hidden mb-3">
            {/* if you store avatar_url, show it */}
            {p.avatar_url ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gray-100" />}
          </div>
          <div className="font-semibold">{p.display_name || p.username}</div>
          <div className="text-sm opacity-60">@{p.username}</div>
          {!!p.roles?.length && <div className="text-xs mt-2">Roles: {p.roles.join(', ')}</div>}
          {!!p.interests?.length && <div className="text-xs mt-1">Interests: {p.interests.join(', ')}</div>}
        </div>
      ))}
    </div>
  );
}
