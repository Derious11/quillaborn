"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { Search, Loader2 } from 'lucide-react';
import ProfileCard from '@/components/features/explore/ProfileCard';

// ---- View + column config ----
const VIEW_NAME = 'user_profiles_public';
const SORT_COLUMN_CANDIDATES = ['updated_at', 'last_active_at', 'last_seen_at'];
const ROLE_NAMES_COLUMN = 'roles';
const INTEREST_NAMES_COLUMN = 'interests';

const PAGE_SIZE = 10;

type FollowCounts = { follower_count: number; following_count: number };
type BadgeRow = {
  badges: { id: string; name: string; description: string; icon_url: string };
  assigned_at?: string | null;
};

export default function ExploreContent({ inDashboard = false }: { inDashboard?: boolean }) {
  const { supabase } = useSupabase();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | ''>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [profiles, setProfiles] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, FollowCounts>>({});
  const [badgesByUser, setBadgesByUser] = useState<Record<string, BadgeRow[]>>({});

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [interests, setInterests] = useState<{ id: number; name: string }[]>([]);

  const [sortColumn, setSortColumn] = useState<string>(SORT_COLUMN_CANDIDATES[0]);

  // Load filter options
  useEffect(() => {
    (async () => {
      const { data: rolesData } = await supabase.from('roles').select('id,name').order('name');
      setRoles(rolesData || []);
      const { data: interestsData } = await supabase.from('interests').select('id,name').order('name');
      setInterests(interestsData || []);
    })();
  }, [supabase]);

  // Detect available sort column in the view by trying in order
  useEffect(() => {
    (async () => {
      for (const col of SORT_COLUMN_CANDIDATES) {
        const { error } = await supabase.from(VIEW_NAME).select(`id, ${col}`).limit(1);
        if (!error) {
          setSortColumn(col);
          return;
        }
      }
      setSortColumn('id');
    })();
  }, [supabase]);

  const offset = useMemo(() => page * PAGE_SIZE, [page]);

  const fetchProfiles = async (opts: { append: boolean; pageOverride?: number }) => {
    const term = search.trim();
    const append = opts.append;
    const pageForFetch = append ? (opts.pageOverride ?? page) : 0;

    if (!append) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    let query = supabase.from(VIEW_NAME).select('*', { count: 'exact' });

    if (term) {
      query = query.or(`display_name.ilike.%${term}%,username.ilike.%${term}%`);
    }
    if (selectedRole !== '') {
      query = query.contains(ROLE_NAMES_COLUMN, [selectedRole]);
    }
    if (selectedInterests.length > 0) {
      query = query.contains(INTEREST_NAMES_COLUMN, selectedInterests);
    }

    query = query.order(sortColumn, { ascending: false, nullsFirst: false });

    const start = append ? pageForFetch * PAGE_SIZE : 0;
    const end = start + PAGE_SIZE - 1;

    const { data, error } = await query.range(start, end);

    if (error) {
      console.error('Explore fetch error:', error);
      if (!append) setLoading(false);
      if (append) setLoadingMore(false);
      return;
    }

    // Update list (with dedupe by id)
    setHasMore((data?.length || 0) === PAGE_SIZE);
    setProfiles(prev => {
      const merged = append ? [...prev, ...(data || [])] : (data || []);
      const seen = new Set<string>();
      return merged.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    });

    // Batch fetch follow counts for these profiles
    const ids = (data ?? []).map(p => p.id).filter(Boolean);
    if (ids.length) {
      const { data: countRows, error: countsErr } = await supabase
        .from('profile_follow_counts')
        .select('profile_id, follower_count, following_count')
        .in('profile_id', ids);

      if (!countsErr && countRows?.length) {
        const pageCounts: Record<string, FollowCounts> = {};
        for (const c of countRows) {
          if (!c.profile_id) continue;
          pageCounts[c.profile_id] = {
            follower_count: Number(c.follower_count ?? 0),
            following_count: Number(c.following_count ?? 0),
          };
        }
        setCounts(prev => (append ? { ...prev, ...pageCounts } : pageCounts));
      } else if (countsErr) {
        // If RLS blocks counts (anon), you can allow anon SELECT on follows or expose a counts RPC.
        console.warn('Counts fetch warning:', countsErr.message);
        if (!append) setCounts({});
      }

      // Fetch badges for these profiles
      const { data: badgeRows, error: badgeErr } = await supabase
        .from('user_badges')
        .select('user_id, assigned_at, badges ( id, name, description, icon_url )')
        .in('user_id', ids);

      if (!badgeErr && badgeRows) {
        const pageBadges: Record<string, BadgeRow[]> = {};
        for (const row of badgeRows as any[]) {
          const key = typeof row.user_id === 'string' ? row.user_id : null;
          if (!key) continue;
          const badge = Array.isArray(row.badges) ? row.badges[0] : row.badges;
          if (!badge) continue;
          const entry: BadgeRow = { badges: badge as BadgeRow['badges'], assigned_at: row.assigned_at ?? row.created_at ?? null };
          if (!pageBadges[key]) pageBadges[key] = [];
          pageBadges[key].push(entry);
        }
        setBadgesByUser(prev => (append ? { ...prev, ...pageBadges } : pageBadges));
      } else if (badgeErr && !append) {
        setBadgesByUser({});
      }
    } else if (!append) {
      setCounts({});
      setBadgesByUser({});
    }

    if (!append) setLoading(false);
    if (append) setLoadingMore(false);
  };

  // Initial + filter/search changes
  useEffect(() => {
    setPage(0);
    fetchProfiles({ append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedRole, selectedInterests, sortColumn]);

  // Load more handler (fixes stale-offset bug)
  const handleLoadMore = () => {
    setPage(prev => {
      const next = prev + 1;
      fetchProfiles({ append: true, pageOverride: next });
      return next;
    });
  };

  // Debounce search input
  const [pendingSearch, setPendingSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(pendingSearch), 300);
    return () => clearTimeout(t);
  }, [pendingSearch]);

  return (
    <div className="relative">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {/* Search */}
        <div className="w-full lg:max-w-md">
          <label className="block text-sm text-gray-400 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40"
              placeholder="Search display name or username"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Role</label>
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value || '')}
            >
              <option value="">All roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2 max-w-xl">
              {interests.map((i) => {
                const active = selectedInterests.includes(i.name);
                return (
                  <button
                    key={i.id}
                    onClick={() =>
                      setSelectedInterests((prev) =>
                        prev.includes(i.name) ? prev.filter((x) => x !== i.name) : [...prev, i.name]
                      )
                    }
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      active
                        ? 'bg-green-500/20 border-green-500 text-green-300'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {i.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            inDashboard={inDashboard}
            followCounts={counts[p.id]} // NEW: show counts on card
            badges={badgesByUser[p.id]}
          />
        ))}
      </div>

      {/* Empty state */}
      {!loading && profiles.length === 0 && (
        <div className="text-center text-gray-400 py-12">No profiles found.</div>
      )}

      {/* Load more */}
      <div className="flex justify-center mt-8">
        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-gray-900 font-semibold flex items-center gap-2"
          >
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
