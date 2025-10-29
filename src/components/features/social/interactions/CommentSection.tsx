"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Comment = {
  id: string;
  comment_text: string;
  user_id: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    username: string | null;
  } | null;
};

type CommentSectionProps = {
  postId: string;
};

export default function CommentSection({ postId }: CommentSectionProps) {
  const { supabase, user } = useSupabase();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchComments() {
    setLoading(true);
    try {
      // 1️⃣ Fetch comments only
      const { data: commentsData, error } = await supabase
        .from("post_interactions")
        .select("id, comment_text, user_id, created_at")
        .eq("post_id", postId)
        .eq("type", "comment")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading comments:", error);
        return;
      }

      if (!commentsData?.length) {
        setComments([]);
        return;
      }

      // 2️⃣ Fetch related profiles separately (only unique user_ids)
      const userIds = Array.from(
        new Set(commentsData.map((c) => c.user_id))
      );

      const { data: profilesData, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, username")
        .in("id", userIds);

      if (profileError) {
        console.error("Error loading profiles:", profileError);
      }

      const profileMap =
        profilesData?.reduce<Record<string, any>>((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {}) ?? {};

      // 3️⃣ Merge comments + profiles
      const combined = commentsData.map((c) => ({
        ...c,
        profile: profileMap[c.user_id] || null,
      }));

      setComments(combined);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function handleSubmit() {
    if (!user || !newComment.trim()) return;

    const payload = {
      post_id: postId,
      user_id: user.id,
      type: "comment",
      comment_text: newComment.trim(),
    };

    const { error } = await supabase.from("post_interactions").insert([payload]);
    if (error) {
      console.error("Error posting comment:", error);
      return;
    }

    setNewComment("");
    fetchComments();
  }

  return (
    <div className="mt-2 space-y-3">
      {/* --- Comment List --- */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-500 text-sm">No comments yet.</div>
      ) : (
        comments.map((c) => (
          <div
            key={c.id}
            className="bg-gray-800/30 rounded-lg p-2 text-sm text-gray-200"
          >
            <span className="font-semibold text-white">
              {c.profile?.display_name ||
                c.profile?.username ||
                "Anonymous"}
            </span>
            <p className="text-gray-300 whitespace-pre-wrap">
              {c.comment_text}
            </p>
          </div>
        ))
      )}

      {/* --- Add Comment --- */}
      <div className="flex gap-2 pt-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-900/40 text-white placeholder-gray-400"
        />
        <Button
          onClick={handleSubmit}
          size="sm"
          disabled={!newComment.trim()}
        >
          Post
        </Button>
      </div>
    </div>
  );
}
