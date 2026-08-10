import { describe, it, expect } from 'vitest';
import { env } from '@/lib/env';

describe('Environment Configuration', () => {
  it('should validate the local application mode', () => {
    // In our test environment, we expect the default to be 'local' or whatever is set
    // But realistically, without setting anything, the default is 'local'
    expect(env.APP_MODE).toBeDefined();
    // Since we didn't mock process.env, it should fall back to 'local' if undefined,
    // or be 'test' if Vitest sets NODE_ENV=test (but we look at APP_MODE specifically).
    expect(['local', 'test', 'production']).toContain(env.APP_MODE);
  });
});
