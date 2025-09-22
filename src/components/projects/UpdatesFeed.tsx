"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useSession } from "@supabase/auth-helpers-react";
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
  const session = useSession();
  const user = session?.user; // ✅ more reliable than useUser()
  const router = useRouter();

  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchUpdates() {
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
    }

    fetchUpdates();
  }, [projectId, supabase]);

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header + Toggle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-white">Project Updates</h2>

        <button
          onClick={() => {
            if (!user) {
              alert("⚠️ Please sign in to post updates.");
              // Optionally: router.push("/login")
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
        <div className="bg-gradient-to-b from-green-700 to-green-800 rounded-xl shadow-lg p-6">
          <PostUpdateForm
            projectId={projectId}
            onSubmitted={() => {
              router.refresh();
              setShowForm(false); // collapse after submit
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
              onRefresh={() => router.refresh()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
