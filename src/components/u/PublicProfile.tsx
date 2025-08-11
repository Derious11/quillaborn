import { Avatar } from "@/components/ui/Avatar";

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

export default function PublicProfile({ profile }: { profile: PublicViewProfile }) {
  const roles = (profile.roles || []).filter(Boolean);
  const interests = (profile.interests || []).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-6">
        <Avatar
          profile={profile as any}
          alt={`${profile.display_name ?? profile.username} avatar`}
          size={20}
        />
        <div>
          <h1 className="text-2xl font-bold">
            {profile.display_name ?? profile.username}
          </h1>
          {profile.username && (
            <p className="text-sm text-gray-400">@{profile.username}</p>
          )}

          {/* Roles */}
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

      {profile.bio && (
        <p className="mt-6 leading-relaxed text-gray-200">{profile.bio}</p>
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
