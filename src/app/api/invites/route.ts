// src/app/api/invites/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { invitedUserId, projectId } = await req.json();

    // Get project name
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get current user (the inviter)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Permission check -> make sure inviter is owner/admin
    const { data: membership, error: membershipError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Insert into project_invites
    const { error: inviteError } = await supabase.from("project_invites").insert([
      {
        project_id: projectId,
        inviter_id: user.id,
        invitee_id: invitedUserId,
        status: "invited",
      },
    ]);

    if (inviteError) {
      console.error("Error saving invite:", inviteError);
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    // Insert notification (optional, but keeps current UX consistent)
    const { error: notifError } = await supabase.from("notifications").insert([
      {
        user_id: invitedUserId,
        kind: "project_invite",
        data: {
          project_id: projectId,
          inviter_id: user.id,
          project_name: project.name ?? "Untitled Project",
          inviter_name: user.user_metadata?.full_name || user.email,
        },
      },
    ]);

    if (notifError) {
      console.error("Error sending notification:", notifError);
      // don’t block invite flow if notification fails
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in invite route:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
