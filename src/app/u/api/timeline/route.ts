// app/u/api/timeline/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ posts: [] });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          cookies().getAll().map((c) => ({ name: c.name, value: c.value })),
      },
    }
  );

  const { data, error } = await supabase
    .from("profile_posts")
    .select("id, body, created_at, updated_at, status, profile_user_id, author_user_id")
    .eq("profile_user_id", profileId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ posts: [], error: error.message }, { status: 400 });
  return NextResponse.json({ posts: data ?? [] });
}
