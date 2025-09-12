import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

interface ProjectPageProps {
  params: { slug: string };
}

export default async function ProjectDashboard({ params }: ProjectPageProps) {
  const supabase = createSupabaseServerClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, summary, slug")
    .eq("slug", params.slug)
    .single();

  if (!project) notFound();

  // Recent updates
  const { data: updates } = await supabase
    .from("project_updates")
    .select("id, content, created_at, author_id")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Recent files
  const { data: files } = await supabase
    .from("project_files")
    .select("id, filename, uploader_id, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Members
  const { data: membersRaw } = await supabase
    .from("project_members")
    .select("user_id, role")
    .eq("project_id", project.id);

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-green-400 mb-3">
          Project Overview
        </h2>
        <p className="text-gray-300">
          {project.summary || "This is the central hub for your project."}
        </p>
      </div>

      {/* Recent Updates */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-green-400 mb-3">
          Recent Updates
        </h2>
        {updates && updates.length > 0 ? (
          <ul className="space-y-2">
            {updates.map((u) => (
              <li key={u.id} className="text-gray-300 text-sm">
                <span className="text-gray-400">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>{" "}
                — {u.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No updates yet.</p>
        )}
      </div>

      {/* Recent Files */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-green-400 mb-3">
          Recent Files
        </h2>
        {files && files.length > 0 ? (
          <ul className="space-y-2">
            {files.map((f) => (
              <li key={f.id} className="text-gray-300 text-sm">
                <span className="text-gray-400">
                  {new Date(f.created_at).toLocaleDateString()}
                </span>{" "}
                — {f.filename}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No files uploaded yet.</p>
        )}
      </div>

      {/* Members Summary */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-green-400 mb-3">Members</h2>
        {membersRaw && membersRaw.length > 0 ? (
          <ul className="flex flex-wrap gap-3">
            {membersRaw.map((m) => (
              <li
                key={m.user_id}
                className="text-gray-300 text-sm px-3 py-1 bg-gray-800 rounded-full"
              >
                {m.role}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No members yet.</p>
        )}
      </div>
    </div>
  );
}
