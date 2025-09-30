"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface Member {
  profiles: {
    id: string;
    display_name: string | null;
    username: string;
    avatar_key?: string;
  } | null;
  role: string;
  status: string;
  title?: string | null;
}

interface TitleOption {
  id: string;
  name: string;
}

function resolveAvatar(avatar_key?: string) {
  if (avatar_key && avatar_key.trim().length > 0) {
    return `/avatars/presets/${avatar_key}`;
  }
  return "/avatars/presets/qb-avatar-00-quill.svg";
}

export default function ProjectSettings() {
  const { supabase, user } = useSupabase();
  const { toast } = useToast();
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
  const [isOwner, setIsOwner] = useState(false);

  const [titleOptions, setTitleOptions] = useState<TitleOption[]>([]);

  // Load project details + members + titles
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
      loadTitles();
    }

    async function loadMembers(projectId: string) {
      setMembersLoading(true);

      const { data: memberData } = await supabase
        .from("project_members")
        .select(
          `
          role,
          title,
          profiles (
            id,
            display_name,
            username,
            avatar_key
          )
        `
        )
        .eq("project_id", projectId);

      const currentUser = memberData?.find(
        (m: any) => m.profiles?.id === user?.id
      );
      setIsOwner(
        currentUser?.role === "owner" || currentUser?.role === "admin"
      );

      const activeMembers =
        (memberData || []).map((row: any) => ({
          role: row.role,
          title: row.title,
          status: "active",
          profiles: row.profiles ? row.profiles : null,
        })) ?? [];

      const { data: inviteData } = await supabase
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

      const invites =
        (inviteData || [])
          .filter((row: any) => row.status !== "accepted")
          .map((row: any) => ({
            role: "editor",
            status: row.status,
            profiles: row.profiles ? row.profiles : null,
          })) ?? [];

      setMembers([...activeMembers, ...invites]);
      setMembersLoading(false);
    }

    async function loadTitles() {
      const { data } = await supabase
        .from("member_titles")
        .select("id, name")
        .order("name");

      setTitleOptions(data || []);
    }

    loadProject();
  }, [params.slug, supabase, user]);

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
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    } else {
      toast({ title: "Saved", description: "Project updated successfully" });
      router.refresh();
    }
  }

  async function deleteProject() {
    if (!project) return;
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    )
      return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } else {
      toast({ title: "Deleted", description: "Project removed successfully" });
      router.push("/dashboard");
    }
  }

  async function updateRole(userId: string, newRole: string) {
    if (!project) return;
    const { error } = await supabase
      .from("project_members")
      .update({ role: newRole })
      .eq("project_id", project.id)
      .eq("user_id", userId);

    if (!error) {
      setMembers((prev) =>
        prev.map((m) =>
          m.profiles?.id === userId ? { ...m, role: newRole } : m
        )
      );
      toast({ title: "Role updated", description: "Member role changed" });
    }
  }

  async function updateTitle(userId: string, newTitle: string) {
    if (!project) return;
    const { error } = await supabase
      .from("project_members")
      .update({ title: newTitle })
      .eq("project_id", project.id)
      .eq("user_id", userId);

    if (!error) {
      setMembers((prev) =>
        prev.map((m) =>
          m.profiles?.id === userId ? { ...m, title: newTitle } : m
        )
      );
      toast({ title: "Title updated", description: `Set to "${newTitle}"` });
    }
  }

  async function removeMember(userId: string) {
    if (!project) return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", project.id)
      .eq("user_id", userId);

    if (!error) {
      setMembers((prev) => prev.filter((m) => m.profiles?.id !== userId));
      toast({ title: "Member removed", description: "User removed from project" });
    }
  }

  if (loading) return <p className="text-gray-400">Loading project...</p>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* General Settings */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-green-400 mb-4">General Settings</h2>
        <div className="space-y-4">
          {/* Project Name */}
          <div>
            <label htmlFor="project-name" className="block text-sm text-gray-400">
              Project Name
            </label>
            {isOwner ? (
              <input
                id="project-name"
                type="text"
                value={name}
                placeholder="Enter project name"
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2"
              />
            ) : (
              <p className="mt-1 text-white">{name}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="project-summary" className="block text-sm text-gray-400">
              Summary
            </label>
            {isOwner ? (
              <textarea
                id="project-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="Enter project summary"
                className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2"
              />
            ) : (
              <p className="mt-1 text-white whitespace-pre-line">{summary}</p>
            )}
          </div>

          {/* Status */}
          {isOwner ? (
            <div>
              <label htmlFor="project-status" className="block text-sm text-gray-400">
                Status
              </label>
              <select
                id="project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-400">Status</label>
              <p className="mt-1 text-white capitalize">{status}</p>
            </div>
          )}

          {/* Save button only for owner/admin */}
          {isOwner && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-900 font-semibold rounded-full transition disabled:opacity-50 w-full sm:w-auto"
              aria-label="Save project changes"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-green-400 mb-4">Project Members</h2>
        {membersLoading ? (
          <p className="text-gray-400">Loading members...</p>
        ) : (
          <ul className="space-y-3">
            {members.map(
              (m) =>
                m.profiles && (
                  <li
                    key={m.profiles.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-800 p-3 rounded-lg gap-3"
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
                        {m.title && (
                          <p className="text-xs text-green-400">{m.title}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          @{m.profiles.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                      {m.status === "active" && isOwner ? (
                        <>
                          <label htmlFor={`role-${m.profiles.id}`} className="sr-only">
                            Role
                          </label>
                          <select
                            id={`role-${m.profiles.id}`}
                            value={m.role}
                            onChange={(e) =>
                              updateRole(m.profiles!.id, e.target.value)
                            }
                            className="bg-gray-700 text-white text-sm rounded px-2 py-1"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>

                          <label htmlFor={`title-${m.profiles.id}`} className="sr-only">
                            Title
                          </label>
                          <select
                            id={`title-${m.profiles.id}`}
                            value={m.title || ""}
                            onChange={(e) =>
                              updateTitle(m.profiles!.id, e.target.value)
                            }
                            className="bg-gray-700 text-white text-sm rounded px-2 py-1"
                          >
                            <option value="">None</option>
                            {titleOptions.map((t) => (
                              <option key={t.id} value={t.name}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <span className="text-gray-300 text-sm capitalize">
                          {m.role}
                        </span>
                      )}

                      {m.status === "active" && isOwner && (
                        <button
                          onClick={() => removeMember(m.profiles!.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition w-full sm:w-auto"
                          aria-label={`Remove ${m.profiles.display_name || m.profiles.username}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </li>
                )
            )}
          </ul>
        )}
      </div>

      {/* Danger Zone (only owner/admin) */}
      {isOwner && (
        <div className="bg-gray-900 border border-red-700 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-400 mb-4">
            Once you delete a project, there is no going back. Please be certain.
          </p>
          <button
            onClick={deleteProject}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition w-full sm:w-auto"
            aria-label="Delete project"
          >
            Delete Project
          </button>
        </div>
      )}
    </div>
  );
}
