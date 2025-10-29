"use client";

import { useEffect, useState } from "react";
import { Smile } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { cn } from "@/lib/utils";

const allReactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

type ReactionCount = {
  reaction_type: string;
  count: number;
};

type ReactionPickerProps = {
  postId: string;
};

export default function ReactionPicker({ postId }: ReactionPickerProps) {
  const { supabase, user } = useSupabase();
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [counts, setCounts] = useState<ReactionCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadReactions() {
      if (!user) return;

      // Fetch all reactions for this post
      const { data: reactionsData, error } = await supabase
        .from("post_interactions")
        .select("reaction_type, user_id")
        .eq("post_id", postId)
        .eq("type", "reaction");

      if (error) {
        console.error("Error loading reactions:", error);
        return;
      }

      // Build reaction counts
      const countMap: Record<string, number> = {};
      let userReact: string | null = null;

      (reactionsData || []).forEach((r) => {
        if (!r.reaction_type) return;
        countMap[r.reaction_type] = (countMap[r.reaction_type] || 0) + 1;
        if (r.user_id === user.id) userReact = r.reaction_type;
      });

      const formattedCounts = Object.entries(countMap).map(([reaction_type, count]) => ({
        reaction_type,
        count,
      }));

      setCounts(formattedCounts);
      setUserReaction(userReact);
      setLoading(false);
    }

    loadReactions();
  }, [postId, user, supabase]);

  async function handleReaction(emoji: string) {
    if (!user) return;

    const isSame = userReaction === emoji;

    if (isSame) {
      // Remove reaction
      await supabase
        .from("post_interactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("type", "reaction");
      setUserReaction(null);
      setCounts((prev) =>
        prev
          .map((r) =>
            r.reaction_type === emoji
              ? { ...r, count: Math.max(0, r.count - 1) }
              : r
          )
          .filter((r) => r.count > 0)
      );
      return;
    }

    // Add or update reaction
    await supabase
      .from("post_interactions")
      .upsert([
        {
          post_id: postId,
          user_id: user.id,
          type: "reaction",
          reaction_type: emoji,
        },
      ]);

    setUserReaction(emoji);

    setCounts((prev) => {
      const exists = prev.find((r) => r.reaction_type === emoji);
      if (exists) {
        return prev.map((r) =>
          r.reaction_type === emoji ? { ...r, count: r.count + 1 } : r
        );
      }
      return [...prev, { reaction_type: emoji, count: 1 }];
    });
  }

  if (loading) return null;

  return (
    <div className="flex items-center gap-2">
      {/* 🔹 Existing Reactions Display */}
      {counts.length > 0 && (
        <div className="flex items-center gap-1">
          {counts.map((r) => {
            const isUser = userReaction === r.reaction_type;
            return (
              <button
                key={r.reaction_type}
                onClick={() => handleReaction(r.reaction_type)}
                className={cn(
                  "text-lg flex items-center gap-1 transition-transform",
                  isUser ? "opacity-100 scale-110" : "opacity-70 hover:opacity-100"
                )}
              >
                <span>{r.reaction_type}</span>
                <span className="text-xs text-gray-300">{r.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 🔹 Add New Reaction Menu */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-1 text-gray-400 hover:text-yellow-400"
            aria-label="Add reaction"
          >
            <Smile className="w-4 h-4" />
            {counts.length === 0 && <span className="text-xs">React</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="flex gap-2 justify-center">
          {allReactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                handleReaction(emoji);
                setOpen(false);
              }}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
