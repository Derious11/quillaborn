"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface PostUpdateFormProps {
  projectId: string;
  onSubmitted?: () => void; // ✅ new prop
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

    const { error } = await supabase.from("project_updates").insert({
      project_id: projectId,
      title,
      body_md: body,
      attachments,
    });

    setLoading(false);

    if (!error) {
      // reset form
      setTitle("");
      setBody("");
      setAttachments([]);
      setNewAttachment("");

      // ✅ collapse + refresh via parent
      onSubmitted?.();
    } else {
      console.error("Error posting update:", error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-green-200 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-green-400 bg-white/10 text-white placeholder-green-100 p-3 focus:ring-2 focus:ring-green-400"
          placeholder="Enter a short title"
          required
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-green-200 mb-1">
          Update
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg border border-green-400 bg-white/10 text-white placeholder-green-100 p-3 focus:ring-2 focus:ring-green-400"
          rows={4}
          placeholder="Write your update (Markdown supported)"
          required
        />
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-green-200 mb-2">
          Attachments (links)
        </label>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="url"
            value={newAttachment}
            onChange={(e) => setNewAttachment(e.target.value)}
            className="flex-1 rounded-lg border border-green-400 bg-white/10 text-white placeholder-green-100 p-3 focus:ring-2 focus:ring-green-400"
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
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-500 text-xs"
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition w-full sm:w-auto"
        >
          {loading ? "Posting…" : "Post Update"}
        </button>
      </div>
    </form>
  );
}
