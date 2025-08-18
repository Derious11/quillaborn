"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { Search, Loader2 } from 'lucide-react';
import ProfileCard from '@/components/features/explore/ProfileCard';

// ---- View + column config ----
const VIEW_NAME = 'user_profiles_public';
// Prefer updated_at; fall back to other candidates if not present
const SORT_COLUMN_CANDIDATES = ['updated_at', 'last_active_at', 'last_seen_at'];
// The view exposes role and interest NAMES as arrays
const ROLE_NAMES_COLUMN = 'roles';
const INTEREST_NAMES_COLUMN = 'interests';

const PAGE_SIZE = 10;

export default function ExploreContent({ inDashboard = false }: { inDashboard?: boolean }) {
  const { supabase } = useSupabase();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | ''>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [profiles, setProfiles] = useState<any[]>([]);
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
      // fallback to id desc if none available
      setSortColumn('id');
    })();
  }, [supabase]);

  const offset = useMemo(() => page * PAGE_SIZE, [page]);

  const fetchProfiles = async (opts: { append: boolean }) => {
    const term = search.trim();
    const append = opts.append;

    if (!append) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    let query = supabase
      .from(VIEW_NAME)
      .select('*', { count: 'exact' });

    // TODO: Add onboarding_complete filtering at the database view level instead
    // Temporarily removing this filter since user_profiles_public view may not include onboarding_complete
    // if (inDashboard) {
    //   query = query.eq('onboarding_complete', true);
    // }

    if (term) {
      // Search both display_name and username
      query = query.or(`display_name.ilike.%${term}%,username.ilike.%${term}%`);
    }

    if (selectedRole !== '') {
      // Filter rows whose roles array contains the selected role name
      query = query.contains(ROLE_NAMES_COLUMN, [selectedRole]);
    }

    if (selectedInterests.length > 0) {
      // Filter rows whose interests array contains all selected interest NAMES
      query = query.contains(INTEREST_NAMES_COLUMN, selectedInterests);
    }

    query = query.order(sortColumn, { ascending: false, nullsFirst: false });

    const start = append ? offset : 0;
    const end = start + PAGE_SIZE - 1;

    const { data, error } = await query.range(start, end);

    if (error) {
      console.error('Explore fetch error:', error);
      if (!append) setLoading(false);
      if (append) setLoadingMore(false);
      return;
    }

    setHasMore((data?.length || 0) === PAGE_SIZE);
    setProfiles(prev => (append ? [...prev, ...(data || [])] : (data || [])));

    if (!append) setLoading(false);
    if (append) setLoadingMore(false);
  };

  // Initial + filter/search changes
  useEffect(() => {
    // Reset to first page on filter/search change
    setPage(0);
    fetchProfiles({ append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedRole, selectedInterests, sortColumn]);

  // Load more handler
  const handleLoadMore = async () => {
    setPage(p => p + 1);
    await fetchProfiles({ append: true });
  };

  // Debounce search input (simple)
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
          <ProfileCard key={p.id} profile={p} inDashboard={inDashboard} />
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
