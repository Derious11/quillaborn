"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { createComment, fetchComments } from "@/lib/community/communityClient";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ThreadPage({ thread, initialComments }: any) {
  const { supabase, user } = useSupabase();
  const [comments, setComments] = useState(initialComments || []);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleComment() {
    if (!user || !body.trim()) return;
    setPosting(true);
    try {
      await createComment(supabase, user.id, thread.id, body);
      const updated = await fetchComments(supabase, thread.id);
      setComments(updated);
      setBody("");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Thread body */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="text-xl font-bold text-white">
          {thread.title}
        </CardHeader>
        <CardContent className="text-gray-300 whitespace-pre-wrap">
          {thread.body_md}
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {comments.length} Comments
        </h2>
        {comments.map((c: any) => (
          <Card key={c.id} className="bg-gray-900 border-gray-700">
            <CardContent className="text-gray-300 text-sm">
              <span className="font-semibold text-green-400">
                {c.profiles?.display_name || c.profiles?.username}
              </span>
              <p>{c.body_md}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comment input */}
      {user && (
        <div className="flex gap-2 mt-4">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment..."
            className="bg-gray-800 border-gray-700 text-gray-200"
          />
          <Button
            onClick={handleComment}
            disabled={posting}
            className="bg-green-500 text-gray-900 font-semibold hover:bg-green-400"
          >
            {posting ? "Posting..." : "Send"}
          </Button>
        </div>
      )}
    </div>
  );
}
