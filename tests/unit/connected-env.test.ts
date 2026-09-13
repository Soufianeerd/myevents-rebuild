import { expect, it } from 'vitest';
import { envSchema } from '@/lib/env';

it('refuses local persistence on Vercel, missing connected configuration and production promotion', () => {
  expect(envSchema.safeParse({ VERCEL: '1', APP_MODE: 'local' }).success).toBe(
    false,
  );
  expect(envSchema.safeParse({ APP_MODE: 'connected' }).success).toBe(false);
  const staging = {
    APP_MODE: 'connected',
    NODE_ENV: 'production',
    VERCEL: '1',
    VERCEL_ENV: 'preview',
    APP_URL: 'https://preview.example.com',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_placeholder',
  };
  expect(envSchema.safeParse(staging).success).toBe(true);
  expect(
    envSchema.safeParse({ ...staging, VERCEL_ENV: 'production' }).success,
  ).toBe(false);
  expect(
    envSchema.safeParse({
      ...staging,
      SUPABASE_URL: 'http://example.supabase.co',
    }).success,
  ).toBe(false);
  expect(
    envSchema.safeParse({
      ...staging,
      SUPABASE_PUBLISHABLE_KEY: 'sb_secret_test',
    }).success,
  ).toBe(false);
  const legacyKey = (role: string) =>
    `${btoa('{}')}.${btoa(JSON.stringify({ role }))}.test-signature`;
  expect(
    envSchema.safeParse({
      ...staging,
      SUPABASE_PUBLISHABLE_KEY: legacyKey('service_role'),
    }).success,
  ).toBe(false);
  expect(
    envSchema.safeParse({
      ...staging,
      SUPABASE_PUBLISHABLE_KEY: legacyKey('anon'),
    }).success,
  ).toBe(true);
  expect(
    envSchema.safeParse({ ...staging, APP_URL: 'http://preview.example.com' })
      .success,
  ).toBe(false);
  expect(
    envSchema.safeParse({
      ...staging,
      APP_URL: 'https://user:password@preview.example.com',
    }).success,
  ).toBe(false);
});
