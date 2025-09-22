// src/app/p/[slug]/updates/page.tsx

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import UpdatesFeed from "@/components/projects/UpdatesFeed";

export default async function UpdatesPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createSupabaseServerClient();

  // Get project by slug
  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-white">{project.name} – Updates</h1>
      {/* Only UpdatesFeed now — form lives inside it */}
      <UpdatesFeed projectId={project.id} />
    </div>
  );
}
