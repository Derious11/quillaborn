"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MessageButton from "@/components/features/social/messages/MessageButton";
import LikeButton from "@/components/features/social/interactions/LikeButton";
import ReactionPicker from "@/components/features/social/interactions/ReactionPicker";
import PostModal from "@/components/features/social/PostModal";
import { AnimatePresence, motion } from "framer-motion";
import PostComposerModal from "@/components/features/social/PostComposerModal";

type InterestItem = { id: number; name: string };
type Interest = {
  interests?: InterestItem | InterestItem[] | null;
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
  userRole?: {
    role_id: number;
    roles: { id: number; name: string } | { id: number; name: string }[] | null;
  } | null;
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
  const [selectedPost, setSelectedPost] = useState<CreativePulse | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  // Optional: auto-close the modal when a new post is created
  useEffect(() => {
    const handlePostCreated = () => setShowComposer(false);
    window.addEventListener("post:created", handlePostCreated);
    return () => window.removeEventListener("post:created", handlePostCreated);
  }, []);

  const displayName =
    profile.display_name || profile.username || user.email || "Creator";

  const formattedInterests = Array.from(
    new Set(
      (userInterests || []).flatMap((interest) => {
        const related = interest.interests;
        if (!related) return [];
        const items = Array.isArray(related) ? related : [related];
        return items
          .map((item) => item.name)
          .filter((name): name is string => Boolean(name));
      })
    )
  );

  return (
    <div className="mx-auto max-w-2xl space-y-12 px-4 py-10 sm:px-0">
      {/* --- Welcome Section --- */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-indigo-500/20 p-6 shadow-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-12 h-48 w-48 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -bottom-16 left-16 h-32 w-32 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6">
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

          <div className="grid grid-cols-3 gap-3">
            <StatPill label="Streak" value={stats.creativeStreakDays} />
            <StatPill label="Projects" value={stats.projectsCount} />
            <StatPill label="Posts" value={stats.postsCount} />
          </div>

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

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/projects/new">
              <Button className="bg-emerald-400 text-gray-900 hover:bg-emerald-300">
                Start a Project
              </Button>
            </Link>

            {/* ✅ Share a Post Button Opens Composer Modal */}
            <Button
              variant="outline"
              onClick={() => setShowComposer(true)}
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              Share a Post
            </Button>

            <PostComposerModal
              open={showComposer}
              onClose={() => setShowComposer(false)}
            />
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
            <AnimatePresence>
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
                const formattedDate = new Date(pulse.created_at).toLocaleDateString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <motion.article
                    key={pulse.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedPost(pulse)}
                    className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 
                      bg-gradient-to-b from-white/5 via-slate-900 to-black/70 p-5 shadow-md 
                      transition hover:border-emerald-300/40 hover:bg-white/10 active:scale-[0.99]"
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            {authorName}
                          </Link>
                          <p className="text-xs text-white/60">
                            {authorHandle} • {formattedDate}
                          </p>
                        </div>
                      </div>

                      {/* Body */}
                      <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-white/90 line-clamp-5">
                        {pulse.body}
                      </p>

                      {/* Interactions */}
                      <div
                        className="mt-2 flex items-center gap-5 text-sm text-white/70"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LikeButton
                          postId={pulse.id}
                          initialCount={pulse.like_count ?? 0}
                        />
                        <ReactionPicker postId={pulse.id} />

                        {/* 💬 Comment Count (Clickable) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(pulse);
                          }}
                          className="flex items-center gap-1 text-white/70 hover:text-emerald-300 transition"
                          aria-label="View comments"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.5 3.75A2.25 2.25 0 002.25 6v8.25A2.25 2.25 0 004.5 16.5H7.5v4.5l4.5-4.5h7.5A2.25 2.25 0 0021.75 14.25V6A2.25 2.25 0 0019.5 3.75h-15z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs">
                            {pulse.comment_count ?? 0}
                          </span>
                        </button>

                        <MessageButton recipientId={pulse.author_user_id} />
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* --- Post Modal --- */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <PostModal
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
