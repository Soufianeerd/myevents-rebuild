import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { env } from '../../../../src/lib/env';

// We need to mock the env module for these tests
vi.mock('../../../../src/lib/env', () => {
  return {
    env: {
      APP_MODE: 'local',
    },
  };
});

describe('createContainer Integration', () => {
  const originalAppMode = env.APP_MODE;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    env.APP_MODE = originalAppMode;
  });

  it('10. should construct local adapters when APP_MODE=local', async () => {
    env.APP_MODE = 'local';
    const { createContainer } =
      await import('../../../../src/server/container');
    const container = createContainer();

    expect(container).toBeDefined();
    expect(container.clock).toBeDefined();
    expect(container.idGenerator).toBeDefined();

    const now = container.clock.now();
    expect(now).toBeInstanceOf(Date);

    const id = container.idGenerator.generate();
    expect(typeof id).toBe('string');
  });

  it('11. should fail explicitly when APP_MODE is unknown', async () => {
    env.APP_MODE = 'unknown-mode' as 'local';
    const { createContainer, __resetContainer } =
      await import('../../../../src/server/container');
    __resetContainer();

    expect(() => createContainer()).toThrowError(
      /Unsupported APP_MODE: unknown-mode/,
    );
  });
});
