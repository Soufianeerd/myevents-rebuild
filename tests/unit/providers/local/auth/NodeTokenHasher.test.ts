import { describe, it, expect } from 'vitest';
import { NodeTokenHasher } from '../../../../../src/providers/local/auth/NodeTokenHasher';

describe('NodeTokenHasher', () => {
  it('should hash consistently using sha256', () => {
    const hasher = new NodeTokenHasher();
    const hash1 = hasher.hashToken('test_token');
    const hash2 = hasher.hashToken('test_token');
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBeGreaterThan(32);
  });
});
