import { createSupabaseServerClient } from "@/lib/supabaseServer";
import ProjectHeader from "@/components/projects/ProjectHeader";
import NavTabs from "@/components/projects/NavTabs"; // 👈 new client component
import { notFound } from "next/navigation";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, summary, slug, status, header_image_path, owner_id")
    .eq("slug", params.slug)
    .single();

  if (!project) notFound();

  const { data: membersRaw } = await supabase
    .from("project_members")
    .select("user_id, role")
    .eq("project_id", project.id);

  const memberIds = membersRaw?.map((m) => m.user_id) ?? [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_key")
    .in("id", memberIds);

  const members =
    membersRaw?.map((m) => {
      const profile = profiles?.find((p) => p.id === m.user_id);
      return {
        id: m.user_id,
        name: profile?.display_name || profile?.username || "Unknown",
        role: m.role,
        avatar_key: profile?.avatar_key,
      };
    }) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/10 via-gray-900 to-gray-900 text-white">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <ProjectHeader project={project} members={members} />
        <NavTabs slug={params.slug} /> {/* 👈 client nav */}
        <div>{children}</div>
      </div>
    </div>
  );
}
