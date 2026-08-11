import { describe, it, expect } from 'vitest';
import { CryptoIdGenerator } from '../../../../src/providers/local/ids/CryptoIdGenerator';

describe('CryptoIdGenerator', () => {
  it('should generate a string ID', () => {
    const generator = new CryptoIdGenerator();
    const id = generator.generate();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const generator = new CryptoIdGenerator();
    const ids = new Set<string>();

    for (let i = 0; i < 100; i++) {
      ids.add(generator.generate());
    }

    expect(ids.size).toBe(100);
  });
});
