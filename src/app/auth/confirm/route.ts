import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/server/supabase/client';
import { env } from '@/lib/env';
import { supabaseConfig } from '@/providers/supabase/config';

export async function GET(request: NextRequest) {
  if (env.APP_MODE !== 'connected' || env.CONNECTED_PROVIDER !== 'supabase')
    return new NextResponse(null, { status: 404 });
  const token = request.nextUrl.searchParams.get('token_hash');
  const config = supabaseConfig();
  if (token && token.length <= 256) {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });
    if (!error)
      return NextResponse.redirect(new URL('/dashboard', config.appUrl));
  }
  return NextResponse.redirect(
    new URL('/connexion?confirmation=invalid', config.appUrl),
  );
}
