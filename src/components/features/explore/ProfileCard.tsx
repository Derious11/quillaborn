"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";

type PublicProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  avatar_kind?: string | null;
  avatar_key?: string | null;
  roles?: string[] | null;
  interests?: string[] | null;
};

type FollowCounts = {
  follower_count: number;
  following_count: number;
};

export default function ProfileCard({
  profile,
  inDashboard = false,
  followCounts, // NEW: pass in from Explore
  badges,
}: {
  profile: PublicProfile;
  inDashboard?: boolean;
  followCounts?: FollowCounts; // NEW
  badges?: Array<{ badges: { id: string; name: string; description: string; icon_url: string }, assigned_at?: string | null }>
}) {
  const name = profile.display_name || profile.username || "Unnamed";
  const username = profile.username || "";
  const roleDisplay =
    profile.roles && profile.roles.length > 0 ? profile.roles[0] : "";
  const interests = profile.interests || [];

  // Use dashboard route if in dashboard, otherwise use public route
  const profileHref = username
    ? inDashboard
      ? `/dashboard/u/${username}`
      : `/u/${username}`
    : "#";

  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [activeBadge, setActiveBadge] = useState<{
    id: string; name: string; description: string; icon_url: string; assigned_at?: string | null
  } | null>(null);

  return (
    <div className="bg-gray-900/60 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <Avatar profile={profile as any} alt={name} size={14} />
          {/* Badges under avatar (smaller) */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {badges.slice(0, 2).map((ub) => (
                <button
                  key={ub.badges.id}
                  type="button"
                  onClick={() => {
                    setActiveBadge({ ...ub.badges, assigned_at: ub.assigned_at ?? null });
                    setIsBadgeModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-gray-800/60 rounded-full px-2.5 py-1 border border-gray-700 hover:border-green-500 hover:bg-gray-700 transition-colors"
                  title={(ub.badges.description || '').replace(
                    'Awarded to the first 100 members of Quillaborn who complete their bio.',
                    'Awarded to the first 100 members of Quillaborn.'
                  )}
                >
                  {ub.badges.icon_url && (
                    <img
                      src={ub.badges.icon_url}
                      alt={ub.badges.name}
                      className="w-5 h-5 rounded-full border border-gray-500"
                    />
                  )}
                  <span className="text-[11px] text-gray-100 font-medium truncate max-w-[7rem]">
                    {ub.badges.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={profileHref}
              className="font-semibold text-white truncate hover:text-green-400"
            >
              {name}
            </Link>
            {username && (
              <span className="text-xs text-gray-400 truncate">@{username}</span>
            )}
          </div>

          {roleDisplay && (
            <div className="text-xs text-green-300 mt-1">{roleDisplay}</div>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="text-sm text-gray-300 mt-4 line-clamp-3">{profile.bio}</p>
      )}

      {interests.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {interests.slice(0, 6).map((name, idx) => (
            <span
              key={`${name}-${idx}`}
              className="bg-green-500/20 text-green-300 px-2.5 py-1 rounded-full text-xs"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* NEW: follower/following counts */}
      {followCounts && (
        <div className="mt-4 flex items-center gap-3 text-xs text-gray-300">
          <span>
            <span className="font-semibold">{followCounts.follower_count ?? 0}</span>{" "}
            Followers
          </span>
          <span className="opacity-50">•</span>
          <span>
            <span className="font-semibold">{followCounts.following_count ?? 0}</span>{" "}
            Following
          </span>
        </div>
      )}

      <div className="mt-5">
        <Link
          href={profileHref}
          className="inline-block text-sm font-semibold px-3 py-1.5 rounded bg-green-500 hover:bg-green-600 text-gray-900"
        >
          View Profile
        </Link>
      </div>

      {/* Badge Modal */}
      <Modal isOpen={isBadgeModalOpen} onClose={() => setIsBadgeModalOpen(false)}>
        <div className="p-6 space-y-4">
          {activeBadge ? (
            <div className="flex items-start gap-4">
              {activeBadge.icon_url && (
                <img
                  src={activeBadge.icon_url}
                  alt={activeBadge.name}
                  className="w-16 h-16 rounded-xl border border-gray-600"
                />
              )}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{activeBadge.name}</h3>
                {activeBadge.assigned_at && (
                  <p className="text-sm text-gray-300">
                    Awarded on {new Date(activeBadge.assigned_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}
                {activeBadge.description && (
                  <p className="text-gray-300">
                    {(activeBadge.description || '').replace(
                      'Awarded to the first 100 members of Quillaborn who complete their bio.',
                      'Awarded to the first 100 members of Quillaborn.'
                    )}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No badge selected</p>
          )}
          <div className="flex justify-end">
            <button
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
              onClick={() => setIsBadgeModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
