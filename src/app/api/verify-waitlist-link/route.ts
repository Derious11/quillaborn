import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const token = req.nextUrl.searchParams.get('token') || '';

  if (!token) return NextResponse.redirect('/access-denied?err=token');

  const { error } = await supabase.rpc('finalize_waitlist_link', { p_token: token });
  if (error) {
    console.error(error);
    return NextResponse.redirect('/access-denied?err=finalize', { status: 303 });
  }

  return NextResponse.redirect('/dashboard', { status: 303 });
}
