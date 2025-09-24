// src/app/api/invites/decline/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { notificationId, projectId, inviterId, projectName } = await req.json();

  // Get current user (the one declining)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Mark the original invite as declined
  await supabase
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

  // Send notification back to inviter
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
    return NextResponse.json(
      { error: notifyError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
