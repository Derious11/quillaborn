// components/u/ProfileTimelineView.tsx
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import PublicProfile from "@/components/u/PublicProfile";
import TimelineComposer from "@/components/profile/TimelineComposer";
import TimelineList from "@/components/profile/TimelineList";

export default async function ProfileTimelineView({ username }: { username: string }) {
  const supabase = createSupabaseServerClient();

  // Viewer (nullable)
  const { data: { user } } = await supabase.auth.getUser();

  // Load public profile by username
  const { data: profile, error } = await supabase
    .from("user_profiles_public")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile || !profile.id) notFound();

  const isOwner = !!user && user.id === profile.id;

  // Count posts for owner callout
  const { count: postsCount } = await supabase
    .from("profile_posts")
    .select("id", { count: "exact", head: true })
    .eq("profile_user_id", profile.id)
    .neq("status", "deleted");

  const hasPosts = (postsCount ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* Profile header/card */}
      <PublicProfile profile={profile} />

      {/* Timeline */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Timeline</h2>

        {/* Owner inline callout when no posts yet */}
        {isOwner && !hasPosts && (
          <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/10 p-3 text-sm">
            Share your first update—what are you working on today?
          </div>
        )}

        {/* Only show composer to the owner */}
        {isOwner && <TimelineComposer />}

        <TimelineList profileId={profile.id} isOwner={isOwner} />
      </section>
    </div>
  );
}
