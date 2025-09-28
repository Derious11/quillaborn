// src/app/api/invites/decline/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { notificationId, projectId, inviterId, projectName } = await req.json();

    // Get current user (the one declining)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Make sure invite exists and is still pending
    const { data: invite, error: inviteError } = await supabase
      .from("project_invites")
      .select("*")
      .eq("project_id", projectId)
      .eq("invitee_id", user.id)
      .eq("status", "invited")
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "Invite not found or already handled" }, { status: 404 });
    }

    // Update invite status → declined
    const { error: updateInviteError } = await supabase
      .from("project_invites")
      .update({ status: "declined", updated_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (updateInviteError) {
      console.error("Error updating invite:", updateInviteError);
      return NextResponse.json({ error: updateInviteError.message }, { status: 500 });
    }

    // Mark the original notification as declined (optional, for UX)
    if (notificationId) {
      const { error: notifUpdateError } = await supabase
        .from("notifications")
        .update({
          read_at: new Date().toISOString(),
          data: {
            status: "declined",
            project_id: projectId,
            inviter_id: inviterId,
            project_name: projectName,
          },
        })
        .eq("id", notificationId);

      if (notifUpdateError) {
        console.error("Error updating invite notification:", notifUpdateError);
        // don’t fail request — invite status is the source of truth
      }
    }

    // Send a new notification back to the inviter
    const { error: notifyError } = await supabase.from("notifications").insert([
      {
        user_id: inviterId,
        kind: "invite_declined",
        data: {
          project_id: projectId,
          project_name: projectName,
          declined_by_id: user.id,
          declined_by_name:
            user.user_metadata?.display_name || user.email || "A user",
        },
      },
    ]);

    if (notifyError) {
      console.error("Error notifying inviter:", notifyError);
      // don’t fail hard — decline is already saved
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in decline route:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
