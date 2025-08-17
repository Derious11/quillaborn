import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.redirect('/login');

  await supabase
    .from('waitlist')
    .upsert({ email: user.email.toLowerCase().trim(), status: 'pending' }, { onConflict: 'email' });

  return NextResponse.redirect('/?requested=1', { status: 303 });
}
