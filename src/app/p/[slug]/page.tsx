import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { FileText } from "lucide-react";

// Category badge color mapping
const categoryColor = (category?: string) => {
  const colors: Record<string, string> = {
    "Concept Art": "bg-blue-600/20 text-blue-300",
    "Character Design": "bg-purple-600/20 text-purple-300",
    "Environment Design": "bg-teal-600/20 text-teal-300",
    "Storyboards": "bg-yellow-600/20 text-yellow-300",
    "Script / Draft": "bg-orange-600/20 text-orange-300",
    "Lore / Notes": "bg-amber-600/20 text-amber-300",
    "Reference Material": "bg-gray-600/20 text-gray-300",
    "Final Artwork": "bg-green-600/20 text-green-300",
    "Cover / Poster": "bg-pink-600/20 text-pink-300",
    "Audio / Voice": "bg-indigo-600/20 text-indigo-300",
    "Video / Animation": "bg-red-600/20 text-red-300",
    "Project Asset / Export": "bg-slate-600/20 text-slate-300",
  };
  return colors[category || ""] || "bg-gray-700/20 text-gray-300";
};

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

  // ✅ Recent updates
  const { data: updates } = await supabase
    .from("project_updates")
    .select(
      `
      id, title, body_md, created_at,
      profiles:profiles!project_updates_author_id_fkey (
        id, username, display_name, avatar_key
      )
    `
    )
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // ✅ Enhanced Recent Files
  const { data: files } = await supabase
    .from("project_files")
    .select(`
      id,
      path,
      file_name,
      file_type,
      file_category,
      updated_at,
      uploader:profiles(display_name, username)
    `)
    .eq("project_id", project.id)
    .order("updated_at", { ascending: false })
    .limit(3);

  // ✅ Members (two-step query)
  const { data: membersRaw } = await supabase
    .from("project_members")
    .select("user_id, role")
    .eq("project_id", project.id);

  let members:
    | {
        id: string;
        role: string;
        display_name: string;
        username: string;
        avatar_key: string | null;
      }[]
    = [];

  if (membersRaw && membersRaw.length > 0) {
    const memberIds = membersRaw.map((m) => m.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_key")
      .in("id", memberIds);

    members =
      membersRaw.map((m) => {
        const profile = profiles?.find((p) => p.id === m.user_id);
        return {
          id: m.user_id,
          role: m.role,
          display_name: profile?.display_name || profile?.username || "User",
          username: profile?.username || "",
          avatar_key: profile?.avatar_key || null,
        };
      }) ?? [];
  }

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
          <ul className="space-y-3">
            {updates.map((u) => {
              const p = Array.isArray(u.profiles)
                ? u.profiles[0]
                : u.profiles;
              const avatar = p?.avatar_key
                ? `/avatars/presets/${p.avatar_key}`
                : "/avatars/presets/qb-avatar-00-quill.svg";
              const name = p?.display_name || p?.username || "User";

              return (
                <li key={u.id} className="text-gray-300 text-sm">
                  <div className="flex items-center gap-2">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-6 h-6 rounded-full border border-green-400"
                    />
                    <span className="font-semibold">{name}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white font-medium">{u.title}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {u.body_md}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400">No updates yet.</p>
        )}
      </div>

      {/* ✅ Enhanced Recent Files */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-green-400 mb-3">
          Recent Files
        </h2>
        {files && files.length > 0 ? (
          <ul className="space-y-3">
            {files.map((f) => {
              const uploader = Array.isArray(f.uploader)
                ? f.uploader[0]
                : f.uploader;

              return (
                <li
                  key={f.id}
                  className="flex items-center justify-between bg-gray-800/50 hover:bg-gray-800/90 rounded-lg px-3 py-2 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                      {f.file_type === "image" ? (
                        <img
                          src={`${process.env
                            .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/public/project-files/${f.path}`}
                          alt={f.file_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-4 h-4 text-green-400" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-100 font-medium truncate max-w-[160px]">
                        {f.file_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {uploader?.display_name ||
                          uploader?.username ||
                          "Unknown"}{" "}
                        • {new Date(f.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {f.file_category && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor(
                          f.file_category
                        )}`}
                      >
                        {f.file_category}
                      </span>
                    )}
                    <a
                      href={`/p/${project.slug}/files`}
                      className="text-xs text-green-400 hover:text-green-300"
                    >
                      View
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-400">No files uploaded yet.</p>
        )}
      </div>

      {/* Members Summary */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-green-400 mb-3">Members</h2>
        {members.length > 0 ? (
          <ul className="flex flex-wrap gap-3">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-2 text-gray-300 text-sm px-3 py-2 bg-gray-800 rounded-full"
              >
                <img
                  src={
                    m.avatar_key
                      ? `/avatars/presets/${m.avatar_key}`
                      : "/avatars/presets/qb-avatar-00-quill.svg"
                  }
                  alt={m.display_name}
                  className="w-6 h-6 rounded-full border border-green-400"
                />
                <span>{m.display_name}</span>
                <span className="text-xs text-gray-400">({m.role})</span>
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
