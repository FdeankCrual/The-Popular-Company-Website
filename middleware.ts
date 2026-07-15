import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from './lib/auth';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN_VIDEO', 'ADMIN_CONTENT', 'ADMIN_EDITOR'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin, /employee, and /cms routes
  if ((pathname.startsWith('/admin') || pathname.startsWith('/employee') || pathname.startsWith('/cms')) && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('tpc_session')?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const session = await verifySessionCookie(sessionCookie);

    if (!session || !session.roles || !Array.isArray(session.roles)) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('tpc_session');
      return response;
    }

    const { roles, email, name } = session;
    const isAdmin = roles.some((r: string) => ADMIN_ROLES.includes(r));

    // Route logic
    if (pathname.startsWith('/admin') && !isAdmin) {
      // Employees trying to access admin
      return NextResponse.redirect(new URL('/employee', request.url));
    }

    if (pathname.startsWith('/employee') && isAdmin) {
      // Admins trying to access employee portal - redirect them to admin
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (pathname.startsWith('/cms')) {
      const isContentWriter = roles.includes('CONTENT WRITER');
      if (!isAdmin && !isContentWriter) {
        // Only Admins or Content Writers can access CMS
        return NextResponse.redirect(new URL('/employee', request.url));
      }

      // Enforce Content Writer restrictions
      if (!isAdmin && isContentWriter && (pathname.startsWith('/cms/gallery') || pathname.startsWith('/cms/web-portfolio'))) {
        return NextResponse.redirect(new URL('/cms/blogs', request.url));
      }
    }

    // Pass the roles and email down in a header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-roles', JSON.stringify(roles));
    requestHeaders.set('x-user-email', email);
    if (name) requestHeaders.set('x-user-name', name);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Root is allowed to be accessed by anyone (it's the public website).

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*', '/cms/:path*', '/'],
};
