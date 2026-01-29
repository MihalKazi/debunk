import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the user has the universal "admin_access" cookie
  const isAuthorized = request.cookies.get('admin_access')?.value === 'true'

  // If trying to access admin without the cookie, send to login
  if (pathname.startsWith('/admin') && !isAuthorized) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
} 