import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const host = hostHeader.toLowerCase().split(':')[0]; // Strip port

  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isAdminSubdomain =
    host === 'admin.tefpc.or.tz' ||
    host === 'admin.localhost' ||
    (process.env.ADMIN_HOST && host === process.env.ADMIN_HOST.toLowerCase());

  const isPublicProductionDomain =
    host === 'tefpc.or.tz' ||
    host === 'www.tefpc.or.tz' ||
    (!isAdminSubdomain && !isLocalhost && (isProduction || host.endsWith('tefpc.or.tz')));

  // --- 1. CSRF Origin Protection for Mutating Requests ---
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.hostname.toLowerCase();

        // Allowed origins: localhost variants or tefpc.or.tz domains
        const isAllowedOrigin =
          originHost === 'localhost' ||
          originHost === '127.0.0.1' ||
          originHost === 'admin.localhost' ||
          originHost === 'tefpc.or.tz' ||
          originHost === 'www.tefpc.or.tz' ||
          originHost === 'admin.tefpc.or.tz';

        if (!isAllowedOrigin) {
          return NextResponse.json(
            { error: 'Forbidden: Cross-Origin Request Blocked (CSRF protection)' },
            { status: 403 }
          );
        }
      } catch (e) {
        return NextResponse.json({ error: 'Forbidden: Invalid Request Origin' }, { status: 403 });
      }
    }
  }

  // --- 2. Public Production Domain: Redirect /admin to admin.tefpc.or.tz ---
  if (isPublicProductionDomain && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
    const adminOrigin = process.env.ADMIN_ORIGIN || 'https://admin.tefpc.or.tz';
    // Preserve route and search query string
    const targetUrl = `${adminOrigin}${pathname}${search}`;
    return NextResponse.redirect(new URL(targetUrl), 308);
  }

  // --- 3. Admin Subdomain Routing (admin.tefpc.or.tz / admin.localhost) ---
  if (isAdminSubdomain) {
    // If request is for an API route or already starts with /admin, continue normally
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
      // Proceed to server-side auth check below
    } else if (pathname === '/' || pathname === '') {
      // Root on admin subdomain maps directly to admin dashboard
      return handleAdminAuth(request, '/admin');
    } else if (pathname === '/login') {
      // /login on admin subdomain maps to /admin/login
      return NextResponse.rewrite(new URL(`/admin/login${search}`, request.url));
    } else if (!pathname.startsWith('/admin') && pathname !== '/health') {
      // Direct subpaths like /bookings, /profile, /insights on admin subdomain
      const rewrittenPath = `/admin${pathname}`;
      return handleAdminAuth(request, rewrittenPath);
    }
  }

  // --- 4. Server-Side Protection for Admin Pages & APIs ---
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    // Skip auth check for login endpoints
    if (
      pathname === '/admin/login' ||
      pathname === '/login' ||
      pathname === '/api/admin/auth/login'
    ) {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('econ_admin_session')?.value;

    if (!sessionCookie) {
      if (pathname.startsWith('/api/admin/')) {
        return NextResponse.json(
          { error: 'Unauthorized: Administrator authentication required.' },
          { status: 401 }
        );
      }

      // Page request without session: redirect to login
      const loginUrl = new URL(isAdminSubdomain ? '/login' : '/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/**
 * Handles auth verification and URL rewrite for admin subdomain pages
 */
function handleAdminAuth(request: NextRequest, targetInternalPath: string) {
  const { search } = request.nextUrl;
  const sessionCookie = request.cookies.get('econ_admin_session')?.value;

  // If unauthenticated, redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authenticated: rewrite internally to target admin route
  return NextResponse.rewrite(new URL(`${targetInternalPath}${search}`, request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:jpg|jpeg|gif|png|webp|svg|pdf|ico)$).*)',
  ],
};
