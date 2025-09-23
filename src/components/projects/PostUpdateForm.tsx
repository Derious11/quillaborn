"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface PostUpdateFormProps {
  projectId: string;
  onSubmitted?: (newUpdate?: any) => void;
}

export default function PostUpdateForm({ projectId, onSubmitted }: PostUpdateFormProps) {
  const supabase = createSupabaseBrowserClient();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("project_updates")
      .insert({
        project_id: projectId,
        title,
        body_md: body,
        attachments,
      })
      .select(
        `
        id, title, body_md, attachments, author_id, created_at, updated_at,
        profiles:profiles!project_updates_author_id_fkey(
          id, username, avatar_kind, avatar_key, avatar_url, display_name
        )
        `
      )
      .single();

    setLoading(false);

    if (!error && data) {
      setTitle("");
      setBody("");
      setAttachments([]);
      setNewAttachment("");
      onSubmitted?.(data); // ✅ parent handles closing
    } else {
      console.error("Error posting update:", error?.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg border border-green-400 bg-white/10 text-white placeholder-green-100 p-2 focus:ring-2 focus:ring-green-400"
        placeholder="New update title"
        required
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full rounded-lg border border-green-400 bg-white/10 text-white placeholder-green-100 p-2 focus:ring-2 focus:ring-green-400"
        rows={4}
        placeholder="Write your update (Markdown supported)"
        required
      />

      {/* Attachments */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={newAttachment}
          onChange={(e) => setNewAttachment(e.target.value)}
          className="flex-1 rounded-lg border border-green-400 bg-white/10 text-white placeholder-green-100 p-2 focus:ring-2 focus:ring-green-400"
          placeholder="Paste link from File Manager"
        />
        <button
          type="button"
          onClick={() => {
            if (newAttachment.trim() !== "") {
              setAttachments((prev) => [...prev, newAttachment.trim()]);
              setNewAttachment("");
            }
          }}
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
        >
          Add
        </button>
      </div>

      {attachments.length > 0 && (
        <ul className="space-y-1 text-sm text-green-100">
          {attachments.map((url, i) => (
            <li key={i} className="flex justify-between items-center">
              <a href={url} target="_blank" rel="noreferrer" className="underline">
                {url}
              </a>
              <button
                type="button"
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="text-red-400 hover:text-red-500 text-xs"
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-start">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
        >
          {loading ? "Posting…" : "Post Update"}
        </button>
      </div>
    </form>
  );
}
