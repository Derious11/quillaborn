// app/admin/waitlist/nudge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();

  // ---- Auth + role guard ----
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

  // ---- Get id from form (preferred) or querystring (fallback) ----
  const url = new URL(req.url);
  let idStr = url.searchParams.get("id") ?? "";

  try {
    const form = await req.formData();
    const fromForm = form.get("id");
    if (typeof fromForm === "string" && fromForm.trim()) idStr = fromForm.trim();
  } catch { /* ignore */ }

  const id = idStr.trim(); // support uuid or bigint safely
  if (!id) return redirectBack(req, "Missing id", true);

  // ---- Fetch target waitlist row ----
  const { data: wl, error: wlErr } = await supabase
    .from("waitlist")
    .select("id,email,last_nudge_at,nudge_count")
    .eq("id", id)
    .single();

  if (wlErr || !wl) return redirectBack(req, "Not found", true);

  // ---- Cooldown: avoid spamming (< 24h) ----
  const now = Date.now();
  if (wl.last_nudge_at && now - new Date(wl.last_nudge_at).getTime() < ONE_DAY_MS) {
    return redirectBack(req, "Too soon (nudged < 24h ago)", true);
  }

  // ---- Send email via Resend ----
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return redirectBack(req, "Server missing RESEND_API_KEY", true);

  const payload = {
    from: "Quillaborn Support <support@quillaborn.com>",
    to: [wl.email],
    subject: "Your creative journey awaits ✨",
    html: `
      <div style="font-family:Inter,Arial,sans-serif">
        <h2 style="color:#2E7D5A;margin:0 0 8px">Your creative journey awaits!</h2>
        <p>We noticed you signed up for early access but haven't finished creating your account.</p>
        <p style="margin:16px 0">
          <a href="https://www.quillaborn.com/signup/"
             style="background:#2E7D5A;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
            Finish Creating Your Account
          </a>
        </p>
        <p style="color:#6b7280">Need help? Reply to this email or write <a href="mailto:support@quillaborn.com">support@quillaborn.com</a>.</p>
      </div>`,
  };

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await resp.json();

    if (!resp.ok) {
      // Log error (admin schema!)
      await supabase.schema("admin").from("email_log").insert({
        template: "waitlist_nudge_v1",
        to_email: wl.email,
        waitlist_id: wl.id,
        status: "error",
        error: body,
        sent_by: user.id,
      });

      // Save failure on the row (requires RLS update policy)
      await supabase
        .from("waitlist")
        .update({
          last_nudge_at: new Date().toISOString(),
          last_nudge_status: "error",
          last_nudge_error: JSON.stringify(body).slice(0, 1000),
        })
        .eq("id", wl.id);

      return redirectBack(req, "Email provider error", true);
    }

    const providerId = body?.id ?? "";

    // ---- Log success + update row ----
    const { error: logErr } = await supabase
      .schema("admin")
      .from("email_log")
      .insert({
        template: "waitlist_nudge_v1",
        to_email: wl.email,
        waitlist_id: wl.id,
        provider_id: providerId,
        status: "sent",
        sent_by: user.id,
      });

    const { error: updErr } = await supabase
      .from("waitlist")
      .update({
        last_nudge_at: new Date().toISOString(),
        last_nudge_status: "sent",
        last_nudge_error: null,
        nudge_count: (wl.nudge_count ?? 0) + 1,
      })
      .eq("id", wl.id);

    if (logErr || updErr) {
      const msg = [
        logErr ? `email_log: ${logErr.message}` : "",
        updErr ? `waitlist: ${updErr.message}` : "",
      ]
        .filter(Boolean)
        .join(" | ");
      return redirectBack(req, `Partial save: ${msg || "unknown"}`, true);
    }

    return redirectBack(req, "Nudge sent", false);
  } catch (e: any) {
    // Exception path: log and mark row
    await supabase
      .schema("admin")
      .from("email_log")
      .insert({
        template: "waitlist_nudge_v1",
        to_email: wl.email,
        waitlist_id: wl.id,
        status: "error",
        error: { message: e?.message ?? "unknown" },
        sent_by: user.id,
      });

    await supabase
      .from("waitlist")
      .update({
        last_nudge_at: new Date().toISOString(),
        last_nudge_status: "error",
        last_nudge_error: (e?.message ?? "unknown").slice(0, 1000),
      })
      .eq("id", wl.id);

    return redirectBack(req, "Exception during send", true);
  }
}

// Helper: redirect back to the list with a popup message
function redirectBack(req: NextRequest, text: string, isError: boolean) {
  const back = new URL("/admin/waitlist", req.url);
  back.searchParams.set(isError ? "err" : "msg", text);
  return NextResponse.redirect(back, 303);
}
