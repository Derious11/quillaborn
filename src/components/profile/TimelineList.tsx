// components/profile/TimelineList.tsx
"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
  status: "active" | "hidden" | "deleted";
  profile_user_id: string;
  author_user_id: string;
};

export default function TimelineList({
  profileId,
  isOwner,
}: {
  profileId: string;
  isOwner: boolean;
}) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const q = new URLSearchParams({ profileId });
      const res = await fetch(`/u/api/timeline?${q.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setPosts(data?.posts ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("timeline:refresh", handler);
    return () => window.removeEventListener("timeline:refresh", handler);
  }, [profileId]);

  if (loading) return <div className="opacity-60">Loading…</div>;
  if (!posts?.length) {
    return (
      <div className="opacity-60">
        No posts yet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <PostItem post={p} isOwner={isOwner} onChanged={load} />
        </li>
      ))}
    </ul>
  );
}

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function PostItem({
  post,
  isOwner,
  onChanged,
}: {
  post: Post;
  isOwner: boolean;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(post.body);
  const limit = 2000;

  async function save() {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > limit) return;

    const res = await fetch(`/api/me/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    const out = await res.json();
    if (!res.ok) {
      alert(out?.error ?? "Failed to save");
      return;
    }
    setEditing(false);
    onChanged();
  }

  async function remove() {
    if (!confirm("Are you sure you want to delete this post? This can’t be undone.")) return;
    const res = await fetch(`/api/me/posts/${post.id}`, { method: "DELETE" });
    const out = await res.json();
    if (!res.ok) {
      alert(out?.error ?? "Failed to delete");
      return;
    }
    onChanged();
  }

  return (
    <div className="space-y-2">
      {!editing ? (
        <>
          <p className="whitespace-pre-wrap">{post.body}</p>
          <div className="text-xs opacity-70 flex items-center gap-2">
            <time dateTime={post.created_at}>{fmt(post.created_at)}</time>
            {post.updated_at !== post.created_at && <span>(edited)</span>}
            {isOwner && (
              <span className="ml-auto flex gap-3">
                <button
                  className="underline"
                  onClick={() => setEditing(true)}
                  aria-label={`Edit post ${post.id}`}
                >
                  Edit
                </button>
                <button
                  className="underline"
                  onClick={remove}
                  aria-label={`Delete post ${post.id}`}
                >
                  Delete
                </button>
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <label htmlFor={`edit-${post.id}`} className="sr-only">Edit post</label>
          <textarea
            id={`edit-${post.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-xl bg-white/10 p-3 outline-none focus:ring-2 ring-white/20"
          />
          <div className="text-xs opacity-70 flex items-center gap-2">
            <span aria-live="polite">{limit - text.length} left</span>
            <span className="ml-auto flex gap-3">
              <button
                className="underline"
                onClick={() => { setEditing(false); setText(post.body); }}
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                className="underline"
                onClick={save}
                disabled={!text.trim() || text.length > limit}
                aria-label="Save post"
              >
                Save
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
