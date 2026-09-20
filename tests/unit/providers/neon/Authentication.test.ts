import { it, expect, vi } from 'vitest';
import {
  NeonAuthenticationProvider,
  type NeonAuthApi,
} from '@/providers/neon/NeonAuthenticationProvider';
const userId = '00000000-0000-4000-8000-000000000001';
const sessionId = '00000000-0000-4000-8000-000000000002';
const tenant = '00000000-0000-4000-8000-000000000003';
const profile = {
  id: userId,
  tenant_id: tenant,
  email: 'test@example.invalid',
  first_name: 'Test',
  last_name: 'User',
};
function setup() {
  const reply = { data: null, error: null };
  const api: NeonAuthApi = {
    session: vi.fn().mockResolvedValue({
      data: {
        user: { id: userId, email: profile.email, emailVerified: true },
        session: { id: sessionId, userId },
      },
      error: null,
    }),
    login: vi.fn().mockResolvedValue(reply),
    register: vi.fn().mockResolvedValue({
      data: { user: { id: userId, emailVerified: false } },
      error: null,
    }),
    logout: vi.fn().mockResolvedValue(reply),
    requestReset: vi.fn().mockResolvedValue(reply),
    reset: vi.fn().mockResolvedValue(reply),
    verify: vi.fn().mockResolvedValue(reply),
    resend: vi.fn().mockResolvedValue(reply),
  };
  const query = vi.fn().mockResolvedValue([profile]);
  const database = vi.fn().mockReturnValue({ query });
  return {
    api,
    query,
    database,
    provider: new NeonAuthenticationProvider(
      api,
      database,
      'https://preview.example.com',
    ),
  };
}
it('authorizes only verified matching user/session IDs and loads the bound application profile', async () => {
  const { api, database, provider } = setup();
  expect(await provider.currentIdentity()).toMatchObject({
    tenantId: tenant,
    user: { id: userId, firstName: 'Test', lastName: 'User' },
  });
  expect(database.mock.calls[0][0]).toMatchObject({
    user: { id: userId },
    session: { id: sessionId },
  });
  for (const data of [
    null,
    {
      user: { id: userId, email: profile.email, emailVerified: false },
      session: { id: sessionId, userId },
    },
    {
      user: { id: userId, email: profile.email, emailVerified: true },
      session: { id: sessionId, userId: tenant },
    },
  ]) {
    vi.mocked(api.session).mockResolvedValueOnce({ data, error: null });
    expect(await provider.currentIdentity()).toBeNull();
  }
  expect(database).toHaveBeenCalledTimes(1);
});
it('enforces password policy before registration or consuming a reset token', async () => {
  const { api, provider } = setup();
  expect(
    (
      await provider.register({
        email: profile.email,
        password: 'short',
        firstName: 'Test',
        lastName: 'User',
      })
    ).ok,
  ).toBe(false);
  expect((await provider.reset('token', 'short')).ok).toBe(false);
  expect(api.register).not.toHaveBeenCalled();
  expect(api.reset).not.toHaveBeenCalled();
});
it('keeps structured names for the server-returned signup ID and requests confirmation', async () => {
  const { provider, api, query } = setup();
  expect(
    await provider.register({
      email: profile.email,
      password: 'A sufficiently long password!',
      firstName: 'Test',
      lastName: 'User',
    }),
  ).toEqual({ ok: true, value: { confirmationRequired: true } });
  expect(api.register).toHaveBeenCalledWith({
    email: profile.email,
    password: 'A sufficiently long password!',
    name: 'Test User',
  });
  expect(query).toHaveBeenCalledOnce();
});
it('does not disclose provider errors or reset-account existence', async () => {
  const { api, provider } = setup();
  vi.mocked(api.login).mockResolvedValue({
    data: null,
    error: { message: 'secret upstream detail' },
  });
  const result = await provider.login(profile.email, 'wrong');
  expect(result.ok).toBe(false);
  expect(JSON.stringify(result)).not.toContain('secret');
  vi.mocked(api.requestReset).mockResolvedValue({
    data: null,
    error: { code: 'USER_NOT_FOUND' },
  });
  await expect(provider.requestReset(profile.email)).resolves.toBeUndefined();
  expect(api.requestReset).toHaveBeenCalledWith({
    email: profile.email,
    redirectTo: 'https://preview.example.com/reinitialiser-mot-de-passe',
  });
});
it('routes unverified logins to confirmation and reports expired OTPs safely', async () => {
  const { api, provider } = setup();
  vi.mocked(api.login).mockResolvedValue({
    data: null,
    error: { code: 'EMAIL_NOT_VERIFIED' },
  });
  expect(await provider.login(profile.email, 'password')).toMatchObject({
    ok: false,
    error: { details: { confirmationRequired: true } },
  });
  vi.mocked(api.verify).mockResolvedValue({
    data: null,
    error: { message: 'provider secret' },
  });
  expect(await provider.verifyEmail(profile.email, '123456')).toMatchObject({
    ok: false,
    error: { message: 'Ce code est invalide ou a expiré.' },
  });
});
it('signs out after reset and does not report success when logout fails', async () => {
  const { api, provider } = setup();
  expect(
    (await provider.reset('token', 'A sufficiently long password!')).ok,
  ).toBe(true);
  expect(api.logout).toHaveBeenCalledOnce();
  vi.mocked(api.logout).mockResolvedValue({
    data: null,
    error: { code: 'NETWORK_ERROR' },
  });
  await expect(
    provider.reset('token', 'A sufficiently long password!'),
  ).rejects.toThrow('sign out');
});

it('reports pending legacy recovery without exposing database details', async () => {
  const { provider, query } = setup();
  query.mockRejectedValue(new Error('private database details'));
  const result = await provider.login(
    profile.email,
    'A sufficiently long password!',
  );
  expect(result).toMatchObject({ ok: false, error: { code: 'FORBIDDEN' } });
  expect(JSON.stringify(result)).toContain('rattachement');
  expect(JSON.stringify(result)).not.toContain('private database details');
});
