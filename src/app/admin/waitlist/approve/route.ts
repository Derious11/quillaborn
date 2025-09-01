// app/admin/waitlist/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { randomBytes } from "crypto";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();

  // Auth + role guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!me || !["admin", "owner"].includes(me.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Parse id from POST form
  let id = '';
  try {
    const form = await req.formData();
    const v = form.get('id');
    if (typeof v === 'string') id = v.trim();
  } catch {}
  if (!id) return redirectBack(req, 'Missing id', true);

  // Fetch waitlist row
  const { data: wl, error: wlErr } = await supabase
    .from('waitlist')
    .select('id,email,status,name')
    .eq('id', id)
    .single();
  if (wlErr || !wl) return redirectBack(req, 'Not found', true);

  // Update to approved
  const { error: updErr } = await supabase
    .from('waitlist')
    .update({ status: 'approved' })
    .eq('id', wl.id);
  if (updErr) return redirectBack(req, updErr.message, true);

  // Generate token and store for verification tracking
  const token = randomBytes(24).toString('hex');
  await supabase
    .from('waitlist_approval_tokens')
    .insert({ email: wl.email.toLowerCase(), token })
    .select('id')
    .single();

  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const link = `${site}/signup?email=${encodeURIComponent(wl.email)}&token=${token}`;

  // Send email via Resend
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return redirectBack(req, 'Missing RESEND_API_KEY', true);

  const firstName = (wl.name || '').split(/\s+/)[0] || '';
  const greeting = firstName ? `Hey ${firstName},` : `Hey there,`;
  const payload = {
    from: 'Quillaborn <support@quillaborn.com>',
    to: [wl.email],
    subject: 'You\'re in! Welcome to Quillaborn',
    html: `
      <div style="font-family:Inter,Arial,sans-serif">
        <h2 style="color:#2E7D5A;margin:0 0 8px">You're in! 🎉</h2>
        <p>${greeting}</p>
        <p>You've been approved for early access to Quillaborn.</p>
        <p style="margin:16px 0">
          <a href="${link}"
             style="background:#2E7D5A;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
            Create your account
          </a>
        </p>
        <p style="color:#6b7280">If the button doesn't work, copy and paste this URL:<br/>${link}</p>
      </div>`
  };

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const body = await resp.json().catch(() => ({}));
    const ok = resp.ok;

    // Log (best-effort)
    await supabase
      .schema('admin')
      .from('email_log')
      .insert({
        template: 'waitlist_approved_v1',
        to_email: wl.email,
        waitlist_id: wl.id,
        provider_id: body?.id ?? null,
        status: ok ? 'sent' : 'error',
        error: ok ? null : body,
        sent_by: user.id,
      });

    if (!ok) return redirectBack(req, 'Email provider error', true);
    return redirectBack(req, 'Approved and email sent', false);
  } catch (e: any) {
    await supabase
      .schema('admin')
      .from('email_log')
      .insert({
        template: 'waitlist_approved_v1',
        to_email: wl.email,
        waitlist_id: wl.id,
        status: 'error',
        error: { message: e?.message ?? 'unknown' },
        sent_by: user.id,
      });
    return redirectBack(req, 'Exception during send', true);
  }
}

function redirectBack(req: NextRequest, text: string, isError: boolean) {
  const back = new URL('/admin/waitlist', req.url);
  back.searchParams.set(isError ? 'err' : 'msg', text);
  return NextResponse.redirect(back, 303);
}
