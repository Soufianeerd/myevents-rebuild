import { afterEach, it, expect, vi } from 'vitest';
vi.mock('next/headers', () => ({
  headers: async () =>
    new Headers({
      origin: 'https://preview.example.com',
      cookie: '__Secure-neon-auth.session_token=test-token',
    }),
  cookies: async () => ({ set: vi.fn() }),
}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});
it('uses the installed SDK with fresh upstream sessions and the intended OTP/reset endpoints', async () => {
  vi.stubEnv('APP_MODE', 'connected');
  vi.stubEnv('CONNECTED_PROVIDER', 'neon');
  vi.stubEnv('APP_URL', 'https://preview.example.com');
  vi.stubEnv(
    'DATABASE_URL',
    'postgresql://myevents_app:placeholder@ep-test-pooler.c-5.eu-central-1.aws.neon.tech/myevents?sslmode=verify-full',
  );
  vi.stubEnv(
    'NEON_AUTH_BASE_URL',
    'https://ep-test.neonauth.c-5.eu-central-1.aws.neon.tech/myevents/auth',
  );
  vi.stubEnv('NEON_AUTH_COOKIE_SECRET', 'a'.repeat(32));
  const fetchMock = vi.fn().mockImplementation(
    async () =>
      new Response(JSON.stringify({ status: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  const { neonAuthApi } = await import('@/server/neon/auth');
  const api = neonAuthApi();
  await api.session();
  await api.session();
  expect(fetchMock).toHaveBeenCalledTimes(2);
  for (const [url] of fetchMock.mock.calls)
    expect(new URL(String(url)).searchParams.get('disableCookieCache')).toBe(
      'true',
    );
  await api.verify({ email: 'test@example.invalid', otp: '123456' });
  expect(String(fetchMock.mock.calls[2][0])).toContain(
    '/email-otp/verify-email',
  );
  expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({
    email: 'test@example.invalid',
    otp: '123456',
  });
  await api.reset({
    token: 'reset-token',
    newPassword: 'A sufficiently long password!',
  });
  expect(String(fetchMock.mock.calls[3][0])).toContain('/reset-password');
  expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toMatchObject({
    token: 'reset-token',
    newPassword: 'A sufficiently long password!',
  });
});
