"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function awardBadgeAction(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const userId = formData.get("user_id") as string;
  const badgeId = formData.get("badge_id") as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!me || !["admin", "owner"].includes(me.role)) redirect("/403");

  const { error } = await supabase.from("user_badges").insert({
    user_id: userId,
    badge_id: badgeId,
    assigned_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
