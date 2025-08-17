// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const PROTECTED = [/^\/dashboard(?:\/|$)/, /^\/u\/.*/]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!PROTECTED.some(rx => rx.test(pathname))) return NextResponse.next()

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
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,onboarding_complete,early_access')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_complete) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  if (!profile.early_access && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/access-denied', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/u/:path*'],
}
