import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import ProfilePage from "@/components/features/user/dashboard/ProfilePage";
import type { Profile } from "@/lib/types";

export default async function ProfileDashboardPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      *,
      pronouns:pronoun_id(display_text)
    `
    )
    .eq("id", user.id)
    .single<Profile>();

  // Interests
  const { data: userInterests } = await supabase
    .from("profile_interests")
    .select(
      `
      interest_id,
      interests (
        id,
        name
      )
    `
    )
    .eq("profile_id", user.id);

  // Role
  const { data: userRole } = await supabase
    .from("profile_roles")
    .select(
      `
      role_id,
      roles (
        id,
        name
      )
    `
    )
    .eq("profile_id", user.id)
    .single();

  // Pronouns list
  const { data: pronounsList } = await supabase
    .from("pronouns")
    .select("id, display_text")
    .order("display_text");

  // Badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select(
      `
      assigned_at,
      badges (
        id,
        name,
        description,
        icon_url
      )
      `
    )
    .eq("user_id", user.id);

  // Normalize badges shape: ensure badges is an object, not array
  const badgesForClient = (userBadges || [])
    .map((ub: any) => ({
      badges: Array.isArray(ub.badges) ? ub.badges[0] : ub.badges,
      assigned_at: ub.assigned_at ?? ub.created_at ?? null,
    }))
    .filter((ub: any) => ub.badges);

  if (profile) {
    return (
      <ProfilePage
        user={user}
        profile={profile}
        userInterests={userInterests || []}
        userRole={userRole}
        pronounsList={pronounsList || []}
        userBadges={badgesForClient}
      />
    );
  } else {
    redirect("/username");
  }
}
