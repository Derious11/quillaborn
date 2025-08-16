// app/admin/users/export.csv/route.ts
import { NextRequest, NextResponse } from "next/server";
import {createSupabaseServerClient } from "@/lib/supabaseServer"; // adjust

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();

  // Guard: require admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!me || !["admin", "owner"].includes(me.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").slice(0, 120);

  // Pull a larger page for export; bump if you need all data (or loop pages)
  const { data: rows, error } = await supabase.rpc("admin_get_user_overview", {
    p_limit: 1000,
    p_offset: 0,
    p_search: q,
  });

  if (error) return new NextResponse(error.message, { status: 500 });

  const header = [
    "user_id",
    "email",
    "username",
    "waitlist_status",
    "onboarding_complete",
    "onboarding_step",
    "early_access",
    "last_sign_in_at",
    "role",
    "waitlist_created_at",
    "profile_updated_at",
    "referred_by",
  ];

  const lines = [
    header.join(","),
    ...(rows ?? []).map((r: any) =>
      [
        r.user_id,
        r.email,
        r.username ?? "",
        r.waitlist_status ?? "",
        r.onboarding_complete ? "true" : "false",
        r.onboarding_step ?? "",
        r.early_access ? "true" : "false",
        r.last_sign_in_at ?? "",
        r.role ?? "",
        r.waitlist_created_at ?? "",
        r.profile_updated_at ?? "",
        r.referred_by ?? "",
      ]
        .map((v: string) => `"${String(v).replaceAll(`"`, `""`)}"`)
        .join(","),
    ),
  ].join("\n");

  return new NextResponse(lines, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users_export.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
