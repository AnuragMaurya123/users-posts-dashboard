import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token  = await getToken({ req: request });
  const url = request.nextUrl; 

  // Public paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up', '/verify'];
  const isPublicPath = publicPaths.some(path => url.pathname.startsWith(path));

  // Redirect authenticated users away from auth pages
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to sign-in
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/verify/:path*',
    '/dashboard/:path*',
  ]
};
