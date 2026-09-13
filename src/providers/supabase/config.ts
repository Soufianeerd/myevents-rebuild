import { env } from '@/lib/env';

export function supabaseConfig() {
  if (
    env.APP_MODE !== 'connected' ||
    !env.SUPABASE_URL ||
    !env.SUPABASE_PUBLISHABLE_KEY ||
    !env.APP_URL
  ) {
    throw new Error(
      'Connected mode requires SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and APP_URL.',
    );
  }
  return {
    url: env.SUPABASE_URL,
    key: env.SUPABASE_PUBLISHABLE_KEY,
    appUrl: new URL(env.APP_URL).origin,
  };
}
