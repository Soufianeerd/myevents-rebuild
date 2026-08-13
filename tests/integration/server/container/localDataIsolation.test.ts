import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createContainer } from '../../../../src/server/container/createContainer';

describe('Local Data Isolation', () => {
  const originalEnv = process.env.LOCAL_DATA_DIR;

  beforeEach(() => {
    // Clean up if it exists
    const testDataDir = path.resolve(process.cwd(), '.data-test-isolation');
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.LOCAL_DATA_DIR;
    } else {
      process.env.LOCAL_DATA_DIR = originalEnv;
    }
    const testDataDir = path.resolve(process.cwd(), '.data-test-isolation');
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  it('should use LOCAL_DATA_DIR for all repositories if provided', async () => {
    process.env.LOCAL_DATA_DIR = '.data-test-isolation';
    const container = createContainer();

    // Trigger writes to all repositories by creating dummy entries
    await container.userRepository.create({
      id: 'test_user_id',
      email: 'isolation@example.com',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      passwordAlgorithm: 'scrypt',
      passwordParams: { N: 65536, r: 8, p: 2 },
      firstName: 'Iso',
      lastName: 'Lation',
      tenantId: 'tenant1',
      passwordUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as import('../../../../src/core/auth/models').User);

    await container.sessionRepository.create({
      id: 'test_session_id',
      userId: 'test_user_id',
      tokenHash: 'token_hash',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 100000).toISOString(),
    } as unknown as import('../../../../src/core/auth/models').Session);

    await container.passwordResetRepository.create({
      id: 'test_reset_id',
      tokenHash: 'reset_hash',
      userId: 'test_user_id',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 100000).toISOString(),
    } as unknown as import('../../../../src/core/auth/models').PasswordResetToken);

    await container.mailProvider.sendPasswordResetEmail(
      'isolation@example.com',
      'http://link',
    );

    // Verify files were created in .data-test-isolation
    const testDataDir = path.resolve(process.cwd(), '.data-test-isolation');
    expect(fs.existsSync(path.join(testDataDir, 'users.json'))).toBe(true);
    expect(fs.existsSync(path.join(testDataDir, 'sessions.json'))).toBe(true);
    expect(fs.existsSync(path.join(testDataDir, 'password-resets.json'))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(testDataDir, 'mail'))).toBe(true);
  });
});
