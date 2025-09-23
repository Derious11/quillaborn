"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import ReactMarkdown from "react-markdown";
import { getAvatarUrl } from "@/lib/avatar-utils";
import type { ProjectUpdate } from "./UpdatesFeed";
import { Modal } from "@/components/ui/modal";

export default function UpdateCard({
  update,
  isAuthor,
  supabase,
  onRefresh,
}: {
  update: ProjectUpdate;
  isAuthor: boolean;
  supabase: ReturnType<typeof createSupabaseBrowserClient>;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(update.title);
  const [body, setBody] = useState(update.body_md);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("project_updates")
      .update({ title, body_md: body, updated_at: new Date().toISOString() })
      .eq("id", update.id);

    setLoading(false);
    if (!error) {
      setEditing(false);
      onRefresh();
    }
  }

  async function handleDelete() {
    setLoading(true);
    const { error } = await supabase
      .from("project_updates")
      .delete()
      .eq("id", update.id);

    setLoading(false);
    setShowDeleteModal(false);
    if (!error) {
      onRefresh();
    }
  }

  const avatarSrc = update.profiles
    ? getAvatarUrl(update.profiles)
    : "/avatars/presets/qb-avatar-00-quill.svg";

  const displayName =
    update.profiles?.display_name || update.profiles?.username || "User";

  return (
    <div className="rounded-xl border bg-gradient-to-b from-green-700/10 to-green-800/20 shadow-md p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img
          src={avatarSrc}
          alt={displayName}
          className="h-10 w-10 rounded-full border border-green-400"
          loading="eager"
        />
        <div>
          <p className="font-semibold text-white">{displayName}</p>
          <p className="text-xs text-green-200">
            {new Date(update.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Body */}
      {editing ? (
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-green-400 bg-white/10 text-white placeholder-green-100 p-2 focus:ring-2 focus:ring-green-400"
            required
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-green-400 bg-white/10 text-white placeholder-green-100 p-2 focus:ring-2 focus:ring-green-400"
            rows={4}
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-white">{update.title}</h3>
          <div className="prose prose-sm prose-invert text-green-100 mt-2">
            <ReactMarkdown>{update.body_md}</ReactMarkdown>
          </div>
        </>
      )}

      {/* Attachments */}
      {update.attachments?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {update.attachments.map((file, i) => (
            <a
              key={i}
              href={file}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 rounded-lg bg-green-900/40 text-green-200 text-sm hover:bg-green-900/60 transition"
            >
              Attachment {i + 1}
            </a>
          ))}
        </div>
      ) : null}

      {/* Author Controls */}
      {isAuthor && !editing && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-green-300 hover:text-white transition"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="text-sm text-red-400 hover:text-red-500 transition"
          >
            Delete
          </button>
        </div>
      )}

      {/* Modern Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white">
            Delete this update?
          </h2>
          <p className="text-gray-300 text-sm">
            This action cannot be undone. Are you sure you want to delete{" "}
            <span className="font-semibold">"{update.title}"</span>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
