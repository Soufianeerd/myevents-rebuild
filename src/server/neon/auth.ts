import { createNeonAuth } from '@neondatabase/auth/next/server';
import { env } from '@/lib/env';
import {
  NeonAuthenticationProvider,
  neonSessionSchema,
  type NeonAuthApi,
} from '@/providers/neon/NeonAuthenticationProvider';
import { scopedNeonDatabase } from './database';

let auth: ReturnType<typeof createNeonAuth> | undefined;
export function neonAuth() {
  if (!env.NEON_AUTH_BASE_URL || !env.NEON_AUTH_COOKIE_SECRET || !env.APP_URL)
    throw new Error('Neon Auth is not configured.');
  return (auth ??= createNeonAuth({
    baseUrl: env.NEON_AUTH_BASE_URL,
    cookies: {
      secret: env.NEON_AUTH_COOKIE_SECRET,
      sameSite: 'lax',
      sessionDataTtl: 60,
    },
    logLevel: 'silent',
  }));
}
export function neonAuthApi(): NeonAuthApi {
  const auth = neonAuth();
  return {
    // SDK 0.5 compares against the literal string "true" in its cache bypass.
    session: () =>
      auth.getSession({
        query: { disableCookieCache: 'true' as unknown as boolean },
      }),
    login: (input) => auth.signIn.email(input),
    register: (input) => auth.signUp.email(input),
    logout: () => auth.signOut(),
    requestReset: (input) => auth.requestPasswordReset(input),
    reset: (input) => auth.resetPassword(input),
    verify: (input) => auth.emailOtp.verifyEmail(input),
    resend: ({ email }) =>
      auth.emailOtp.sendVerificationOtp({ email, type: 'email-verification' }),
  };
}
export function createNeonAuthenticationProvider() {
  return new NeonAuthenticationProvider(
    neonAuthApi(),
    (session) =>
      scopedNeonDatabase(
        session
          ? { userId: session.user.id, sessionId: session.session.id }
          : null,
      ),
    env.APP_URL!,
  );
}
export async function authenticatedNeonDatabase() {
  const result = await neonAuthApi().session();
  const session = neonSessionSchema.safeParse(result.data);
  if (result.error || !session.success)
    throw new Error('Verified authentication required.');
  return scopedNeonDatabase({
    userId: session.data.user.id,
    sessionId: session.data.session.id,
  });
}
