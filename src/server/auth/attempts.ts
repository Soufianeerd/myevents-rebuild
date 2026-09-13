import { createContainer } from '@/server/container';

export const AUTH_LIMIT_MESSAGE =
  'Trop de tentatives. Réessayez dans quelques minutes.';

export async function allowAuthAttempt(
  operation: 'login' | 'register' | 'forgot' | 'reset',
  subject: string,
): Promise<boolean> {
  const { authAttemptLimiter, tokenHasher } = createContainer();
  // No trust in client-controlled forwarding headers. Aggregate protection also
  // bounds distinct-identity attacks and the number of persisted buckets.
  if (!(await authAttemptLimiter.allow('auth:aggregate', 60, 60_000)))
    return false;
  const key = tokenHasher.hashToken(
    `${operation}:${subject.trim().toLowerCase()}`,
  );
  return authAttemptLimiter.allow(
    key,
    operation === 'forgot' ? 3 : 10,
    15 * 60_000,
  );
}
