import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

async function sendEmail(to: string, url: string) {
  // TODO: integrate your mailer here
  console.log('Email link to', to, url);
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const form = await req.formData();
  const raw = (form.get('waitlist_email') || '') as string;
  const waitlist_email = raw.toLowerCase().trim();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return NextResponse.redirect('/login');

  const token = randomBytes(24).toString('hex');

  const { error } = await supabase
    .from('email_link_claims')
    .insert({
      target_uid: user.id,
      waitlist_email,
      token,
    });

  if (error) {
    console.error(error);
    return NextResponse.redirect('/access-denied?err=claim', { status: 303 });
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-waitlist-link?token=${token}`;
  await sendEmail(waitlist_email, url);

  return NextResponse.redirect('/access-denied?sent=1', { status: 303 });
}
