// src/app/api/invites/accept/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { notificationId, projectId } = await req.json();

  // Get current user (the one accepting)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Insert into project_members
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

  // Mark notification as read/accepted
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  return NextResponse.json({ success: true });
}
