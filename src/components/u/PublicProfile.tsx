import { Avatar } from "@/components/ui/avatar";
import FollowCounts from "@/components/features/social/follow/FollowCounts";
import FollowButton from "@/components/features/social/follow/FollowButton";
import MessageButton from "@/components/features/social/messages/MessageButton";
import BadgeChips, { type BadgeRow } from "@/components/u/BadgeChips";

type PublicViewProfile = {
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

export default function PublicProfile({ profile, badges = [] }: { profile: PublicViewProfile, badges?: BadgeRow[] }) {
  const roles = (profile.roles || []).filter(Boolean);
  const interests = (profile.interests || []).filter(Boolean);
  const name = profile.display_name ?? profile.username ?? "Profile";


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header: avatar + identity */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        <div className="sm:self-start shrink-0 flex flex-col items-center gap-2">
          <Avatar profile={profile as any} alt={`${name} avatar`} size={16} />
          <BadgeChips badges={badges} />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{name}</h1>
          {profile.username && (
            <p className="text-sm text-gray-400 truncate">@{profile.username}</p>
          )}

          {/* Counts + actions (wrap on mobile) */}
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="order-1 sm:order-none">
              <FollowCounts profileId={profile.id} username={profile.username} />
            </div>

            {/* Make actions sit on their own line on mobile to avoid squish */}
            <div className="order-2 sm:order-none flex gap-2 w-full sm:w-auto">
              {/* Wrappers make them stretch full-width on mobile even if the components don't take className */}
              <div className="flex-1 sm:flex-none">
                <FollowButton targetProfileId={profile.id} />
              </div>
              <div className="flex-1 sm:flex-none">
                <MessageButton recipientId={profile.id} />
              </div>
            </div>
          </div>

          {/* Roles (chips) */}
          {roles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {roles.map((r, idx) => (
                <span
                  key={`${r}-${idx}`}
                  className="inline-block text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/40"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="mt-6 text-sm sm:text-base leading-relaxed text-gray-200 break-words">
          {profile.bio}
        </p>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-2">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((i, idx) => (
              <span
                key={`${i}-${idx}`}
                className="inline-block text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-200 border border-gray-700"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
