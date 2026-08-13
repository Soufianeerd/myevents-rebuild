import { describe, it, expect } from 'vitest';
import { NodeSecretTokenProvider } from '../../../../../src/providers/local/auth/NodeSecretTokenProvider';

describe('NodeSecretTokenProvider', () => {
  it('should generate a 64 character hex string by default', () => {
    const provider = new NodeSecretTokenProvider();
    const token = provider.generateToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(32);
  });
});
