import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const phone = request.cookies.get('phone')?.value;
    
    if (phone !== '0123456789') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/user')) {
    const phone = request.cookies.get('phone')?.value;
    
    if (!phone) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = { 
  matcher: [
    "/admin/:path*",
    "/user/:path*",
  ]
};
