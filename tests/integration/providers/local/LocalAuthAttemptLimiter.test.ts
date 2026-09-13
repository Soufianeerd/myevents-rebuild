import { expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalAuthAttemptLimiter } from '@/providers/local/auth/LocalAuthAttemptLimiter';

it('enforces concurrent attempts across adapters, survives reconstruction and expires', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'myevents-limits-'));
  let now = 0;
  const clock = { now: () => new Date(now) };
  try {
    const attempts = await Promise.all(
      Array.from({ length: 12 }, () =>
        new LocalAuthAttemptLimiter(dir, clock).allow(
          'opaque-subject',
          3,
          1000,
        ),
      ),
    );
    expect(attempts.filter(Boolean)).toHaveLength(3);
    expect(
      await new LocalAuthAttemptLimiter(dir, clock).allow(
        'opaque-subject',
        3,
        1000,
      ),
    ).toBe(false);
    expect(
      await new LocalAuthAttemptLimiter(dir, clock).allow(
        'different-subject',
        3,
        1000,
      ),
    ).toBe(true);
    now = 1000;
    expect(
      await new LocalAuthAttemptLimiter(dir, clock).allow(
        'opaque-subject',
        3,
        1000,
      ),
    ).toBe(true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
