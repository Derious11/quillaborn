import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import NewProjectClient from "./NewProjectClient";

export default async function NewProjectPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/projects/new");
  }

  return <NewProjectClient />;
}
