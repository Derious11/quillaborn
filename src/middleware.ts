// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Keep middleware light: only ensure session and basic auth for protected paths.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  // Waitlist gating per spec
  const email = (user.email || '').toLowerCase().trim()
  if (!email) {
    return NextResponse.redirect(new URL('/no-access?state=unknown', req.url))
  }

  const { data: wl } = await supabase
    .from('waitlist')
    .select('status')
    .eq('email', email)
    .maybeSingle<{ status: string }>()

  if (wl?.status === 'approved') {
    return res
  }
  if (wl?.status === 'pending') {
    return NextResponse.redirect(new URL('/no-access?state=pending', req.url))
  }
  return NextResponse.redirect(new URL('/no-access?state=unknown', req.url))
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
