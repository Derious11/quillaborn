"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  postId: string;
  initialCount?: number;
};

export default function LikeButton({ postId, initialCount = 0 }: LikeButtonProps) {
  const { supabase, user } = useSupabase();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(true);

  // ✅ Load both like count + whether user liked
  useEffect(() => {
    async function loadLikes() {
      if (!user) return;

      // Check if user liked
      const { data: likedData } = await supabase
        .from("post_interactions")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("type", "like")
        .maybeSingle();

      setLiked(!!likedData);

      // Get total like count
      const { count: totalLikes, error } = await supabase
        .from("post_interactions")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("type", "like");

      if (error) {
        console.error("Error loading like count:", error);
      }

      setCount(totalLikes || 0);
      setLoading(false);
    }

    loadLikes();
  }, [postId, user, supabase]);

  async function toggleLike() {
    if (!user || loading) return;

    setLoading(true);

    if (liked) {
      // Unlike
      const { error } = await supabase
        .from("post_interactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("type", "like");

      if (error) console.error("Unlike error:", error);

      setLiked(false);
      setCount((prev) => Math.max(0, prev - 1));
    } else {
      // Like
      const { error } = await supabase
        .from("post_interactions")
        .insert([{ post_id: postId, user_id: user.id, type: "like" }]);

      if (error) console.error("Like error:", error);

      setLiked(true);
      setCount((prev) => prev + 1);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={cn(
        "flex items-center gap-1 text-sm transition-colors select-none",
        liked ? "text-pink-500" : "text-gray-400 hover:text-pink-400"
      )}
    >
      <Heart
        className={cn("w-4 h-4", liked ? "fill-pink-500" : "fill-none")}
      />
      <span>{count}</span>
    </button>
  );
}
