import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/leads', '/customers', '/follow-ups', '/teams', '/reports', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Auth is enforced client-side via the AuthGuard component.
  // The middleware cannot read the browser's Supabase session,
  // so we let the request through and let the guard redirect.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/leads/:path*', '/customers/:path*', '/follow-ups/:path*', '/teams/:path*', '/reports/:path*', '/settings/:path*'],
};
