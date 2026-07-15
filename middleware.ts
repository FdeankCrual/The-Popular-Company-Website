import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes, but allow /admin/login and /api/admin/auth
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('tpc_session')?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const session = await verifySessionCookie(sessionCookie);

    if (!session) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('tpc_session');
      return response;
    }

    // RBAC: Role-Based Access Control
    const { role } = session;

    // Leads are only for SUPER_ADMIN and MANAGER
    if (pathname.startsWith('/admin/leads') && role === 'CREATOR') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Content is only for SUPER_ADMIN and CREATOR
    if (pathname.startsWith('/admin/content') && role === 'MANAGER') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Pass the role down in a header so the layout/pages can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', role);
    requestHeaders.set('x-user-email', session.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
