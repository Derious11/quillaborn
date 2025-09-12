"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const supabase = createSupabaseServerClient();

  const name = formData.get("name") as string;
  const summary = formData.get("summary") as string | null;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { data, error } = await supabase.rpc("create_project_secure", {
    p_name: name,
    p_slug: slug,
    p_summary: summary,
  });

  if (error) {
    if (error.message.includes("FREE_LIMIT_REACHED")) {
      throw new Error("Free users can only have one active project. Archive or upgrade.");
    }
    throw error;
  }

  const projectId = data as string;

  revalidatePath("/projects");

  return { id: projectId, slug };
}