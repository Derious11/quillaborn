"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import PostUpdateForm from "./PostUpdateForm";
import UpdateCard from "./UpdateCard";
import type { Profile } from "@/lib/types";

interface UpdatesFeedProps {
  projectId: string;
}

export interface ProjectUpdate {
  id: string;
  title: string;
  body_md: string;
  attachments?: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
}

export default function UpdatesFeed({ projectId }: UpdatesFeedProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<any>(null);

  // ✅ Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, [supabase]);

  // ✅ Centralized fetchUpdates
  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_updates")
      .select(
        `
        id, title, body_md, attachments, author_id, created_at, updated_at,
        profiles:profiles!project_updates_author_id_fkey(
          id, username, avatar_kind, avatar_key, avatar_url, display_name
        )
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped = (data as any[]).map((u) => ({
        ...u,
        profiles: u.profiles ?? null,
      })) as ProjectUpdate[];
      setUpdates(mapped);
    }
    setLoading(false);
  }, [projectId, supabase]);

  // ✅ Run on mount
  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header + Toggle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-white">Project Updates</h2>

        <button
          onClick={() => {
            if (!user) {
              alert("⚠️ Please sign in to post updates.");
              return;
            }
            setShowForm((prev) => !prev);
          }}
          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition w-full sm:w-auto"
        >
          {showForm ? "Cancel" : "+ New Update"}
        </button>
      </div>

      {/* Collapsible Form */}
      {showForm && user && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6">
          <PostUpdateForm
            projectId={projectId}
            onSubmitted={() => {
              fetchUpdates(); // ✅ reload feed after submit
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* Updates Feed */}
      {loading ? (
        <p className="text-gray-300">Loading updates…</p>
      ) : updates.length === 0 ? (
        <p className="text-gray-300">No updates yet. Be the first to post!</p>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              isAuthor={user?.id === update.author_id}
              supabase={supabase}
              onRefresh={fetchUpdates} // ✅ reload after edit/delete
            />
          ))}
        </div>
      )}
    </div>
  );
}
