import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { UserId, TenantId } from '../../../../src/core/ids';
import { LocalUserRepository } from '../../../../src/providers/local/auth/LocalUserRepository';
import { User } from '../../../../src/core/auth/models';

describe('LocalUserRepository', () => {
  const dataDir = path.resolve(process.cwd(), '.data-test');
  let repo: LocalUserRepository;

  beforeEach(async () => {
    await fs.mkdir(dataDir, { recursive: true });
    repo = new LocalUserRepository(dataDir);
  });

  afterEach(async () => {
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('should save and find a user by ID and email', async () => {
    const user: User = {
      id: 'user_1' as UserId,
      tenantId: 'tenant_1' as TenantId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash: 'abc',
      passwordSalt: '123',
      passwordAlgorithm: 'test',
      passwordParams: { N: 1, r: 1, p: 1 },
      passwordUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await repo.create(user);

    const foundById = await repo.findById('user_1' as UserId);
    expect(foundById).toBeDefined();
    expect(foundById?.email).toBe('john@example.com');

    const foundByEmail = await repo.findByEmail('john@example.com');
    expect(foundByEmail).toBeDefined();
    expect(foundByEmail?.id).toBe('user_1');
  });

  it('should return null if user not found', async () => {
    const foundById = await repo.findById('non_existent' as UserId);
    expect(foundById).toBeNull();
  });
});
