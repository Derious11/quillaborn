// app/api/me/posts/[id]/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { supabaseClientOptions } from "@/lib/supabaseClientOptions";
import type { Database } from "@/types/database";

function createRouteClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...supabaseClientOptions,
      cookies: {
        getAll: () => cookies().getAll().map((c) => ({
          name: c.name,
          value: c.value,
        })),
      },
    },
  );
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = (body?.body ?? "").toString().trim();
  if (!text || text.length > 2000) {
    return NextResponse.json(
      { error: "Body must be 1–2000 chars" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("profile_posts")
    .update({ body: text })
    .eq("id", params.id)
    .eq("profile_user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("profile_posts")
    .update({ status: "deleted" })
    .eq("id", params.id)
    .eq("profile_user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
