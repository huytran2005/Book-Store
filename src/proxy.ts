import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve auth cookies
  const isLoggedIn = request.cookies.get('session_logged_in')?.value === 'true';
  const userRole = request.cookies.get('session_role')?.value || '';

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      // Redirect to login if not logged in
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (userRole !== 'admin') {
      // Redirect to home or a forbidden page if not admin
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect client private routes (profile, orders, checkout)
  const privateRoutes = ['/profile', '/orders', '/checkout'];
  if (privateRoutes.some(route => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If logged in, redirect away from auth pages (login, register)
  const authRoutes = ['/login', '/register'];
  if (authRoutes.includes(pathname)) {
    if (isLoggedIn) {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to these paths
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/login',
    '/register',
  ],
};
