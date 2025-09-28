// src/app/api/invites/accept/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const { notificationId, projectId } = await req.json();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify invite exists
    const { data: invite, error: inviteError } = await supabase
      .from("project_invites")
      .select("id, status")
      .eq("project_id", projectId)
      .eq("invitee_id", user.id)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.status !== "invited") {
      return NextResponse.json({ error: "Invite already handled" }, { status: 400 });
    }

    // Add user to project_members
    const { error: memberError } = await supabase.from("project_members").insert([
      {
        project_id: projectId,
        user_id: user.id,
        role: "member",
      },
    ]);

    if (memberError) {
      console.error("Error adding member:", memberError);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Update invite status → accepted
    await supabase
      .from("project_invites")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", invite.id);

    // Mark the notification as read
    if (notificationId) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in accept route:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
