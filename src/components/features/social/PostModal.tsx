"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import LikeButton from "@/components/features/social/interactions/LikeButton";
import ReactionPicker from "@/components/features/social/interactions/ReactionPicker";
import CommentSection from "@/components/features/social/interactions/CommentSection";
import MessageButton from "@/components/features/social/messages/MessageButton";
import Link from "next/link";
import type { CreativePulse } from "@/components/features/user/dashboard/HomePage";

interface PostModalProps {
  post: CreativePulse | null;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: PostModalProps) {
  if (!post) return null;

  const authorName =
    post.author?.display_name || post.author?.username || "Creator";
  const authorHandle = post.author?.username ? `@${post.author.username}` : "";
  const authorProfileHref = post.author?.username
    ? `/dashboard/u/${post.author.username}`
    : "/dashboard/community";

  const formattedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={!!post} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-slate-900 to-black/90 border border-white/10 text-white">
        <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
                Post by {authorName}
            </DialogTitle>
            <DialogDescription className="sr-only">
                View full post, reactions, and comments.
            </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          {/* --- Author Info --- */}
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/20 bg-black/40 p-0.5">
              <Avatar profile={post.author ?? undefined} size={12} alt={authorName} />
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
          <p className="whitespace-pre-line text-base leading-relaxed text-white/90">
            {post.body}
          </p>

          {/* --- Interactions --- */}
          <div className="flex items-center gap-4 pt-2">
            <LikeButton postId={post.id} initialCount={post.like_count ?? 0} />
            <ReactionPicker postId={post.id} />
            <MessageButton recipientId={post.author_user_id} />
          </div>

          {/* --- Comments --- */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <CommentSection postId={post.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
