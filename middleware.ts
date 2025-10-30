import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Don't redirect webhook endpoints
  if (pathname.startsWith('/api/webhook')) {
    return NextResponse.next()
  }

  // Redirect non-www to www
  if (hostname === 'bildoro.app') {
    const url = request.nextUrl.clone()
    url.host = 'www.bildoro.app'
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}