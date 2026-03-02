import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // CSRF protection: reject cross-origin mutations to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const method = request.method.toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      if (origin && host && !origin.endsWith(host)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
