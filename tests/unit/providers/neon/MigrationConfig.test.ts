import { it, expect } from 'vitest';
import { targetConnection } from '../../../../scripts/migration/prepare-application.mjs';
import { validateBinding } from '../../../../scripts/migration/bind-legacy-identity.mjs';
it('refuses default branches, owner mismatches and unrelated migration targets', () => {
  const valid =
    'postgresql://myevents_owner:test@ep-fancy-brook-b1nk9qf4-pooler.c-5.eu-central-1.aws.neon.tech/myevents';
  expect(targetConnection(valid).hostname).toBe(
    'ep-fancy-brook-b1nk9qf4.c-5.eu-central-1.aws.neon.tech',
  );
  expect(targetConnection(valid).searchParams.get('sslmode')).toBe(
    'verify-full',
  );
  for (const invalid of [
    valid.replace('myevents_owner', 'myevents_app'),
    valid.replace('fancy-brook-b1nk9qf4', 'different'),
    valid.replace('/myevents', '/postgres'),
  ])
    expect(() => targetConnection(invalid)).toThrow();
});
it('requires both verified emails and refuses a different or already-bound identity', () => {
  const source = {
    email: 'Owner@Example.invalid',
    email_confirmed_at: '2026-01-01',
    neon_user_id: null,
  };
  const target = {
    id: 'target',
    email: 'owner@example.invalid',
    emailVerified: true,
    banned: false,
  };
  expect(() => validateBinding(source, target)).not.toThrow();
  for (const user of [
    { ...target, emailVerified: false },
    { ...target, banned: true },
    { ...target, email: 'someone@example.invalid' },
  ])
    expect(() => validateBinding(source, user)).toThrow();
  expect(() =>
    validateBinding({ ...source, email_confirmed_at: null }, target),
  ).toThrow();
  expect(() =>
    validateBinding({ ...source, neon_user_id: 'other' }, target),
  ).toThrow();
});
