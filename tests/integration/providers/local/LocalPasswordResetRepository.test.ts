import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { LocalPasswordResetRepository } from '../../../../src/providers/local/auth/LocalPasswordResetRepository';
import { UserId } from '../../../../src/core/ids';
import { PasswordResetTokenId } from '../../../../src/core/auth/models';

describe('LocalPasswordResetRepository', () => {
  const dataDir = path.resolve(process.cwd(), '.data-test2');
  let repo: LocalPasswordResetRepository;

  beforeEach(async () => {
    await fs.mkdir(dataDir, { recursive: true });
    repo = new LocalPasswordResetRepository(dataDir);
  });

  afterEach(async () => {
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('should save and consume a token atomically', async () => {
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    await repo.create({
      id: 'token_1' as PasswordResetTokenId,
      tokenHash: 'hash_123',
      userId: 'user_1' as UserId,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    const now = new Date().toISOString();

    // First consume should succeed
    const result1 = await repo.consumeValidToken('hash_123', now);
    expect(result1.ok).toBe(true);
    if (result1.ok) {
      expect(result1.value.userId).toBe('user_1');
    }

    // Second consume should fail (already used)
    const result2 = await repo.consumeValidToken('hash_123', now);
    expect(result2.ok).toBe(false);
  });

  it('should return error if token is expired', async () => {
    const expiresAt = new Date(Date.now() - 3600 * 1000).toISOString(); // In the past
    await repo.create({
      id: 'token_2' as PasswordResetTokenId,
      tokenHash: 'hash_expired',
      userId: 'user_1' as UserId,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    const now = new Date().toISOString();

    const result = await repo.consumeValidToken('hash_expired', now);
    expect(result.ok).toBe(false);
  });
});
