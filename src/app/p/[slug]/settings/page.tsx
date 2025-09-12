"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";

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
      router.refresh(); // re-fetch server data
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete project");
    } else {
      alert("Project deleted");
      router.push("/p"); // redirect back to projects list
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
