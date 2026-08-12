import { describe, it, expect } from 'vitest';
import { ScryptPasswordHasher } from '../../../../../src/providers/local/auth/ScryptPasswordHasher';

describe('ScryptPasswordHasher', () => {
  it('should hash and verify successfully', async () => {
    const hasher = new ScryptPasswordHasher();
    const password = 'mySecretPassword123';

    const hashInfo = await hasher.hash(password);

    expect(hashInfo.algorithm).toBe('scrypt');
    expect(hashInfo.hash).toBeDefined();
    expect(hashInfo.salt).toBeDefined();

    const isValid = await hasher.verify(password, hashInfo);
    expect(isValid).toBe(true);
  });

  it('should generate unique salts', async () => {
    const hasher = new ScryptPasswordHasher();
    const password = 'samePassword';

    const hash1 = await hasher.hash(password);
    const hash2 = await hasher.hash(password);

    expect(hash1.salt).not.toBe(hash2.salt);
    expect(hash1.hash).not.toBe(hash2.hash);
  });

  it('should reject incorrect password', async () => {
    const hasher = new ScryptPasswordHasher();
    const password = 'correctPassword';

    const hashInfo = await hasher.hash(password);

    const isValid = await hasher.verify('wrongPassword', hashInfo);
    expect(isValid).toBe(false);
  });
});
