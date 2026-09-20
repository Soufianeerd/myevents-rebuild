import { expect, it } from 'vitest';
import { envSchema, deploymentEnvironment } from '@/lib/env';

it('refuses local persistence on Vercel, missing connected configuration and production promotion', () => {
  expect(envSchema.safeParse({ VERCEL: '1', APP_MODE: 'local' }).success).toBe(
    false,
  );
  expect(envSchema.safeParse({ APP_MODE: 'connected' }).success).toBe(false);
  const staging = {
    APP_MODE: 'connected',
    CONNECTED_PROVIDER: 'supabase',
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

it('requires restricted pooled Neon credentials and a private cookie signing secret', () => {
  const valid = {
    APP_MODE: 'connected',
    CONNECTED_PROVIDER: 'neon',
    APP_URL: 'https://preview.example.com',
    DATABASE_URL:
      'postgresql://myevents_app:placeholder@ep-example-pooler.c-5.eu-central-1.aws.neon.tech/myevents?sslmode=verify-full',
    NEON_AUTH_BASE_URL:
      'https://ep-example.neonauth.c-5.eu-central-1.aws.neon.tech/myevents/auth',
    NEON_AUTH_COOKIE_SECRET: 'x'.repeat(32),
  };
  expect(envSchema.safeParse(valid).success).toBe(true);
  for (const url of [
    valid.DATABASE_URL.replace('myevents_app', 'myevents_owner'),
    valid.DATABASE_URL.replace('-pooler.', '.'),
    valid.DATABASE_URL.replace('verify-full', 'disable'),
    valid.DATABASE_URL.replace('.neon.tech', '.attacker.test'),
  ])
    expect(envSchema.safeParse({ ...valid, DATABASE_URL: url }).success).toBe(
      false,
    );
  expect(
    envSchema.safeParse({ ...valid, NEON_AUTH_COOKIE_SECRET: 'short' }).success,
  ).toBe(false);
  expect(
    envSchema.safeParse({ ...valid, VERCEL_ENV: 'production' }).success,
  ).toBe(false);
});

it('uses only a Vercel Preview system hostname as the initial auth origin', () => {
  const preview = {
    VERCEL: '1',
    VERCEL_ENV: 'preview',
    VERCEL_BRANCH_URL: 'myevents-git-neon-team.vercel.app',
  };
  expect(deploymentEnvironment(preview).APP_URL).toBe(
    'https://myevents-git-neon-team.vercel.app',
  );
  expect(
    deploymentEnvironment({
      ...preview,
      VERCEL_BRANCH_URL: undefined,
      VERCEL_URL: 'myevents-deploy-team.vercel.app',
    }).APP_URL,
  ).toBe('https://myevents-deploy-team.vercel.app');
  expect(
    deploymentEnvironment({
      ...preview,
      APP_URL: 'https://staging.example.com',
    }).APP_URL,
  ).toBe('https://staging.example.com');
  for (const host of [
    'attacker.test',
    'myevents.vercel.app.attacker.test',
    'user@myevents.vercel.app',
    'myevents.vercel.app/path',
    'https://myevents.vercel.app',
    'myevents.vercel.app?x=1',
  ]) {
    expect(
      deploymentEnvironment({ ...preview, VERCEL_BRANCH_URL: host }).APP_URL,
    ).toBeUndefined();
  }
  expect(
    deploymentEnvironment({ ...preview, VERCEL_ENV: 'production' }).APP_URL,
  ).toBeUndefined();
  expect(
    deploymentEnvironment({ ...preview, VERCEL: undefined }).APP_URL,
  ).toBeUndefined();
});
