import { env } from '@/lib/env';
import type { AuthenticationProvider } from '@/providers/contracts/auth/AuthenticationProvider';

export async function createAuthenticationProvider(): Promise<AuthenticationProvider> {
  if (env.APP_MODE === 'local') {
    const { LocalAuthenticationProvider } = await import('./local');
    return new LocalAuthenticationProvider();
  }
  if (env.CONNECTED_PROVIDER === 'neon') {
    const { createNeonAuthenticationProvider } =
      await import('@/server/neon/auth');
    return createNeonAuthenticationProvider();
  }
  const { createSupabaseServerClient } =
    await import('@/server/supabase/client');
  const { SupabaseAuthenticationProvider } =
    await import('@/providers/supabase/SupabaseAuthenticationProvider');
  const { supabaseConfig } = await import('@/providers/supabase/config');
  return new SupabaseAuthenticationProvider(
    await createSupabaseServerClient(),
    supabaseConfig().appUrl,
  );
}
