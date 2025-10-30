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
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center backdrop-blur-sm">
      <p className="text-[0.7rem] uppercase tracking-wide text-white/70">{label}</p>
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

  const formattedInterests = Array.from(
    new Set(
      (userInterests || [])
        .flatMap<string>((interest) => {
          const interestsArray =
            Array.isArray(interest.interests) ? interest.interests : [];
          return interestsArray.map((i: { id: number; name: string }) => i.name);
        })
        .filter((name): name is string => Boolean(name))
    )
  );

  const shareHref = profile.username
    ? `/dashboard/u/${profile.username}`
    : "/dashboard/profile";

  return (
    <div className="mx-auto max-w-2xl space-y-12 px-4 py-10 sm:px-0">
      {/* --- Welcome Section --- */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-indigo-500/20 p-6 shadow-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-12 h-48 w-48 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -bottom-16 left-16 h-32 w-32 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6">
          {/* Avatar + Greeting */}
          <div className="flex items-center gap-4">
            <div className="rounded-full border-2 border-white/30 bg-black/30 p-1">
              <Avatar profile={profile} alt={displayName} size={16} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Welcome back
              </p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                {displayName} 👋
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/80">
                Ready to keep the momentum? Your creative world is buzzing —
                dive in and share your spark.
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <StatPill label="Streak" value={stats.creativeStreakDays} />
            <StatPill label="Projects" value={stats.projectsCount} />
            <StatPill label="Posts" value={stats.postsCount} />
          </div>

          {/* Interests */}
          {formattedInterests.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {formattedInterests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/70"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/projects/new">
              <Button className="bg-emerald-400 text-gray-900 hover:bg-emerald-300">
                Start a Project
              </Button>
            </Link>
            <Link href={shareHref}>
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                Share a Post
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- Creative Feed --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Creative Feed</h2>
          <Link
            href="/dashboard/community"
            className="text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
          >
            Explore more →
          </Link>
        </div>

        {creativePulses.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            <p>No posts yet. Share your thoughts to spark the feed!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
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
              const formattedDate = new Date(pulse.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <article
                  key={pulse.id}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 via-slate-900 to-black/70 p-5 shadow-md transition hover:border-emerald-300/40"
                >
                  <div className="absolute -top-10 right-0 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl" />

                  <div className="relative flex flex-col gap-3">
                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="rounded-full border border-white/20 bg-black/30 p-0.5">
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

                    {/* Body */}
                    <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-white/90">
                      {pulse.body}
                    </p>

                    {/* Interactions */}
                    <div className="mt-2 flex items-center gap-4">
                      <LikeButton
                        postId={pulse.id}
                        initialCount={pulse.like_count ?? 0}
                      />
                      <ReactionPicker postId={pulse.id} />
                      <MessageButton recipientId={pulse.author_user_id} />
                    </div>

                    {/* Comments */}
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <CommentSection postId={pulse.id} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
