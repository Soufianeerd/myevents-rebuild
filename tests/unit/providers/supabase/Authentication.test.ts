import { expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthenticationProvider } from '@/providers/supabase/SupabaseAuthenticationProvider';

it('rejects weak passwords before exchanging a recovery token, then revokes sessions after success', async () => {
  const auth = {
    verifyOtp: vi
      .fn()
      .mockResolvedValue({ data: { user: { id: 'owner' } }, error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
  const provider = new SupabaseAuthenticationProvider(
    { auth } as unknown as SupabaseClient,
    'https://preview.example.com',
  );
  expect((await provider.reset('recovery-hash', 'TooShort123')).ok).toBe(false);
  expect(auth.verifyOtp).not.toHaveBeenCalled();
  expect(
    (await provider.reset('recovery-hash', 'SecurePassword123!Long')).ok,
  ).toBe(true);
  expect(auth.verifyOtp).toHaveBeenCalledWith({
    token_hash: 'recovery-hash',
    type: 'recovery',
  });
  expect(auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
  auth.verifyOtp.mockResolvedValue({
    data: { user: null },
    error: { message: 'expired' },
  });
  auth.updateUser.mockClear();
  expect(
    (await provider.reset('recovery-hash', 'SecurePassword123!Long')).ok,
  ).toBe(false);
  expect(auth.updateUser).not.toHaveBeenCalled();
});

it('does not query profiles for a forged or revoked session', async () => {
  const auth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid' },
    }),
  };
  const from = vi.fn();
  const provider = new SupabaseAuthenticationProvider(
    { auth, from } as unknown as SupabaseClient,
    'https://preview.example.com',
  );
  expect(await provider.currentIdentity()).toBeNull();
  expect(from).not.toHaveBeenCalled();
});
