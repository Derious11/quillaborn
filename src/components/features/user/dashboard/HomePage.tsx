"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MessageButton from "@/components/features/social/messages/MessageButton";
import LikeButton from "@/components/features/social/interactions/LikeButton";
import ReactionPicker from "@/components/features/social/interactions/ReactionPicker";
import CommentSection from "@/components/features/social/interactions/CommentSection";

type Interest = {
  interests?: { id: number; name: string }[] | null;
};

export type CreativePulse = {
  id: string;
  body: string;
  created_at: string;
  author_user_id: string;
  author?: Pick<
    Profile,
    "id" | "display_name" | "username" | "avatar_key" | "avatar_url" | "avatar_kind"
  > | null;
  like_count?: number;
  comment_count?: number;
  reaction_count?: number;
};

interface HomePageProps {
  user: User;
  profile: Profile;
  userInterests?: Interest[];
  userRole?: any;
  stats: {
    creativeStreakDays: number;
    projectsCount: number;
    postsCount: number;
    followersCount: number;
  };
  creativePulses: CreativePulse[];
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export default function HomePage({
  user,
  profile,
  userInterests,
  stats,
  creativePulses,
}: HomePageProps) {
  const displayName =
    profile.display_name || profile.username || user.email || "Creator";

  // ✅ Safe flattening of interests (works for arrays or singles)
const formattedInterests = Array.from(
  new Set(
    (userInterests || [])
      .flatMap<string>((interest) => {
        const interestsArray =
          Array.isArray(interest.interests) ? interest.interests : [];

        // Explicit type on flatMap <string> tells TS this returns strings
        return interestsArray.map((i: { id: number; name: string }) => i.name);
      })
      .filter((name): name is string => Boolean(name))
  )
);

  const shareHref = profile.username
    ? `/dashboard/u/${profile.username}`
    : "/dashboard/profile";

  return (
    <div className="space-y-10">
      {/* --- Hero / Welcome Section --- */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-indigo-500/20 p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-12 h-48 w-48 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -bottom-16 left-16 h-32 w-32 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full border-2 border-white/40 bg-black/40 p-1">
                <Avatar profile={profile} alt={displayName} size={16} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                  Welcome back
                </p>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  {displayName} 👋
                </h1>
                <p className="mt-2 max-w-xl text-sm text-white/80">
                  Ready to keep the momentum? Your creative world is buzzing —
                  jump in and make the next move.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              <span className="flex items-center gap-2 text-base font-medium text-white">
                ✨ Your creative streak:{" "}
                <span className="text-emerald-200">
                  {stats.creativeStreakDays}
                </span>{" "}
                days
              </span>
              <span className="hidden text-white/40 sm:inline">•</span>
              <span>
                Projects:{" "}
                <span className="font-semibold text-white">
                  {stats.projectsCount}
                </span>
              </span>
              <span className="hidden text-white/40 sm:inline">•</span>
              <span>
                Posts:{" "}
                <span className="font-semibold text-white">
                  {stats.postsCount}
                </span>
              </span>
              <span className="hidden text-white/40 sm:inline">•</span>
              <span>
                Followers:{" "}
                <span className="font-semibold text-white">
                  {stats.followersCount}
                </span>
              </span>
            </div>

            {formattedInterests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formattedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link href="/projects/new">
                <Button className="bg-emerald-400 text-gray-900 hover:bg-emerald-300">
                  Start a New Project
                </Button>
              </Link>
              <Link href={shareHref}>
                <Button
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  Share a Post
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatPill label="Projects" value={stats.projectsCount} />
            <StatPill label="Posts" value={stats.postsCount} />
            <StatPill label="Followers" value={stats.followersCount} />
          </div>
        </div>
      </section>

      {/* --- Creative Feed Section --- */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Creative Feed</h2>
            <p className="text-sm text-white/60">
              Fresh sparks from creators you follow and the wider community.
            </p>
          </div>
          <Link
            href="/dashboard/community"
            className="text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
          >
            Dive into the community →
          </Link>
        </div>

        {creativePulses.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            <p>
              No community activity yet. Share your first post or start a
              project to light the feed!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {creativePulses.map((pulse) => {
              const authorName =
                pulse.author?.display_name ||
                pulse.author?.username ||
                "Creator";
              const authorHandle = pulse.author?.username
                ? `@${pulse.author.username}`
                : "";
              const authorProfileHref = pulse.author?.username
                ? `/dashboard/u/${pulse.author.username}`
                : "/dashboard/community";
              const createdAt = new Date(pulse.created_at);
              const formattedDate = createdAt.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={pulse.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-slate-900 to-black/60 p-6 shadow-lg transition hover:border-emerald-300/50"
                >
                  <div className="absolute -top-12 right-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl transition group-hover:bg-emerald-400/20" />

                  <div className="relative flex flex-col gap-4">
                    {/* --- Author Info --- */}
                    <div className="flex items-center gap-3">
                      <div className="rounded-full border border-white/20 bg-black/40 p-0.5">
                        <Avatar
                          profile={pulse.author ?? undefined}
                          size={10}
                          alt={authorName}
                        />
                      </div>
                      <div>
                        <Link
                          href={authorProfileHref}
                          className="font-semibold text-white hover:underline"
                        >
                          {authorName}
                        </Link>
                        <p className="text-xs text-white/60">
                          {authorHandle} • {formattedDate}
                        </p>
                      </div>
                    </div>

                    {/* --- Post Body --- */}
                    <p className="text-sm leading-relaxed text-white/90">
                      {pulse.body}
                    </p>

                    {/* --- Interactions --- */}
                    <div className="flex items-center gap-4 pt-2">
                      <LikeButton
                        postId={pulse.id}
                        initialCount={pulse.like_count ?? 0}
                      />
                      <ReactionPicker postId={pulse.id} />
                      <MessageButton recipientId={pulse.author_user_id} />
                    </div>

                    {/* --- Comments --- */}
                    <CommentSection postId={pulse.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
