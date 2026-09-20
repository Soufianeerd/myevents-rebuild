import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { supabaseConfig } from '@/providers/supabase/config';

export async function proxy(request: NextRequest) {
  if (env.APP_MODE === 'local') return NextResponse.next();
  if (env.CONNECTED_PROVIDER === 'neon') {
    if (!/^\/(dashboard|events)(\/|$)/.test(request.nextUrl.pathname))
      return NextResponse.next();
    const { neonAuth } = await import('@/server/neon/auth');
    const response = await neonAuth().middleware({ loginUrl: '/connexion' })(
      request,
    );
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }
  const config = supabaseConfig();
  let response = NextResponse.next({ request });
  const client = createServerClient(config.url, config.key, {
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  await client.auth.getClaims();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/events/:path*',
    '/connexion',
    '/inscription',
    '/mot-de-passe-oublie',
    '/reinitialiser-mot-de-passe',
    '/auth/:path*',
  ],
};
