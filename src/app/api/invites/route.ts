// src/app/api/invites/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { invitedUserId, projectId, projectName } = await req.json();

  // Get current user (the inviter)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // TODO: add permission check -> make sure user.id is project owner/admin

  // Insert notification for invited user
  const { error } = await supabase.from("notifications").insert([
    {
      user_id: invitedUserId,
      kind: "project_invite",
      data: {
        project_id: projectId,
        inviter_id: user.id,
        project_name: projectName,
        invter_name: user.user_metadata.full_name || user.email,
        projectName: projectName,
      },
    },
  ]);

  if (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
