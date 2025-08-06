import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Get the current path
  const { pathname } = req.nextUrl;

  // Protected routes that require early access
  const protectedRoutes = [
    '/dashboard',
    '/username',
    '/bio',
    '/interest',
    '/role'
  ];

  // Public routes that should not be protected
  const publicRoutes = [
    '/login',
    '/signup',
    '/no-access',
    '/',
    '/about',
    '/contact',
    '/how-it-works',
    '/pricing',
    '/privacy',
    '/terms'
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Skip middleware for public routes
  if (isPublicRoute) {
    return res;
  }

  // Only run auth checks for protected routes
  if (isProtectedRoute) {
    try {
      const supabase = createMiddlewareClient({ req, res });

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // User is not authenticated, redirect to login
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // User is authenticated, check if they have early access
      const { data: profile } = await supabase
        .from('profiles')
        .select('early_access')
        .eq('id', session.user.id)
        .single();

      if (!profile?.early_access) {
        // User doesn't have early access, redirect to no-access page
        return NextResponse.redirect(new URL('/no-access', req.url));
      }
    } catch (error) {
      // If there's an error parsing cookies or any other middleware error,
      // just continue without blocking the request
      console.error('Middleware auth error:', error);
      return res;
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
