'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { insertFollow, deleteFollow } from './api';

export default function FollowButton({ targetProfileId }: { targetProfileId: string }) {
  const { supabase, user } = useSupabase();
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const isSelf = !!user && user.id === targetProfileId;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user || isSelf) { setIsFollowing(false); return; }
      const { data, error } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', user.id)
        .eq('followed_id', targetProfileId)
        .maybeSingle();
      if (mounted) setIsFollowing(!error && !!data);
    })();
    return () => { mounted = false; };
  }, [supabase, user, targetProfileId, isSelf]);

  const toggle = async () => {
    if (!user || isSelf || isFollowing === null) return;
    setBusy(true);
    try {
      if (isFollowing) {
        await deleteFollow(supabase, targetProfileId);
        setIsFollowing(false);
      } else {
        await insertFollow(supabase, targetProfileId);
        setIsFollowing(true);
      }
    } finally {
      setBusy(false);
    }
  };

  if (!user || isSelf) return null;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`px-3 py-1.5 rounded-lg text-sm border transition
        ${isFollowing ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                      : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'}`}
    >
      {isFollowing ? (busy ? 'Unfollowing…' : 'Unfollow') : (busy ? 'Following…' : 'Follow')}
    </button>
  );
}
