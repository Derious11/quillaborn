"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Member {
  profiles: {
    id: string;
    display_name: string | null;
    username: string;
    avatar_key?: string;
  } | null;
  role: string;
  status: string;
}

function resolveAvatar(avatar_key?: string) {
  if (avatar_key && avatar_key.trim().length > 0) {
    return `/avatars/presets/${avatar_key}`;
  }
  return "/avatars/presets/qb-avatar-00-quill.svg";
}

export default function ProjectSettings() {
  const { supabase } = useSupabase();
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("active");

  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // Load project details + members
  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, summary, status")
        .eq("slug", params.slug)
        .single();

      if (error) {
        console.error("Error loading project:", error);
        setLoading(false);
        return;
      }

      setProject(data);
      setName(data.name || "");
      setSummary(data.summary || "");
      setStatus(data.status || "active");
      setLoading(false);

      loadMembers(data.id);
    }

    async function loadMembers(projectId: string) {
      setMembersLoading(true);

      // 1. Active members
      const { data: memberData, error: memberError } = await supabase
        .from("project_members")
        .select(
          `
          role,
          profiles (
            id,
            display_name,
            username,
            avatar_key
          )
        `
        )
        .eq("project_id", projectId);

      if (memberError) {
        console.error("Error loading members:", memberError);
      }

      // 2. Pending/declined invites
      const { data: inviteData, error: inviteError } = await supabase
        .from("project_invites")
        .select(
          `
          id,
          status,
          invitee_id,
          profiles:invitee_id (
            id,
            display_name,
            username,
            avatar_key
          )
        `
        )
        .eq("project_id", projectId);

      if (inviteError) {
        console.error("Error loading invites:", inviteError);
      }

      // Normalize both lists
      const activeMembers =
        (memberData || []).map((row: any) => ({
          role: row.role,
          status: "active",
          profiles: row.profiles ? row.profiles : null,
        })) ?? [];

      const invites =
        (inviteData || []).map((row: any) => ({
          role: "member",
          status: row.status,
          profiles: row.profiles ? row.profiles : null,
        })) ?? [];

      setMembers([...activeMembers, ...invites]);
      setMembersLoading(false);
    }

    loadProject();
  }, [params.slug, supabase]);

  async function handleSave() {
    if (!project) return;
    setSaving(true);

    const { error } = await supabase
      .from("projects")
      .update({
        name,
        summary,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    setSaving(false);

    if (error) {
      console.error("Save error:", error);
      alert("Failed to save changes");
    } else {
      alert("Changes saved ✅");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (
      !confirm(
        "Are you sure you want to delete this project? This cannot be undone."
      )
    )
      return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete project");
    } else {
      alert("Project deleted");
      router.push("/p");
    }
  }

  if (loading) {
    return <p className="text-gray-400">Loading project...</p>;
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-green-400 mb-4">
          General Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-900 font-semibold rounded-full transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-green-400 mb-4">
          Project Members
        </h2>
        {membersLoading ? (
          <p className="text-gray-400">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-gray-400">No members yet.</p>
        ) : (
          <ul className="space-y-3">
            {members.map(
              (m) =>
                m.profiles && (
                  <li
                    key={m.profiles.id}
                    className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={resolveAvatar(m.profiles.avatar_key)}
                        alt={m.profiles.display_name || m.profiles.username}
                        width={32}
                        height={32}
                        className="rounded-full border border-green-400"
                      />
                      <div>
                        <span className="text-white font-medium">
                          {m.profiles.display_name || m.profiles.username}
                        </span>
                        <p className="text-xs text-gray-500">
                          @{m.profiles.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {m.status === "active" ? (
                        <span className="text-gray-300 text-sm capitalize">
                          {m.role}
                        </span>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            m.status === "invited"
                              ? "bg-yellow-600 text-yellow-100"
                              : m.status === "declined"
                              ? "bg-red-600 text-red-100"
                              : "bg-gray-600 text-gray-100"
                          }`}
                        >
                          {m.status}
                        </span>
                      )}
                      {m.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:text-red-400 hover:border-red-400 rounded-full"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </li>
                )
            )}
          </ul>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-900 border border-red-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-gray-400 mb-4">
          Once you delete a project, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition"
        >
          Delete Project
        </button>
      </div>
    </div>
  );
}
