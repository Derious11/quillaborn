import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";

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

export default function ProfileCard({ profile, inDashboard = false }: { profile: PublicProfile; inDashboard?: boolean }) {
  const name = profile.display_name || profile.username || "Unnamed";
  const username = profile.username || "";
  const roleDisplay =
    profile.roles && profile.roles.length > 0 ? profile.roles[0] : "";
  const interests = profile.interests || [];

  // Use dashboard route if in dashboard, otherwise use public route
  const profileHref = username 
    ? (inDashboard ? `/dashboard/u/${username}` : `/u/${username}`)
    : "#";

  return (
    <div className="bg-gray-900/60 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar profile={profile as any} alt={name} size={14} />

        <div className="min-w-0">
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

      <div className="mt-5">
        <Link
          href={profileHref}
          className="inline-block text-sm font-semibold px-3 py-1.5 rounded bg-green-500 hover:bg-green-600 text-gray-900"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

