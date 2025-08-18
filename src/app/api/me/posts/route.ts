// app/api/me/posts/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function sb() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookies().getAll().map(c => ({ name: c.name, value: c.value })) } }
  );
}

export async function POST(req: Request) {
  const supabase = sb();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body } = await req.json().catch(() => ({}));
  const text = (body ?? "").toString().trim();
  if (!text || text.length > 2000) {
    return NextResponse.json({ error: "Body must be 1–2000 chars" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profile_posts")
    .insert({
      profile_user_id: user.id,
      author_user_id: user.id,
      body: text,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
