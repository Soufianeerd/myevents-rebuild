import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalSessionRepository } from '../../../../src/providers/local/auth/LocalSessionRepository';
import { SessionId } from '../../../../src/core/auth';
import { UserId } from '../../../../src/core/ids';
import * as fs from 'fs';
import * as path from 'path';

describe('LocalSessionRepository', () => {
  const dataDir = path.join(
    process.cwd(),
    '.data-test-sessions-' + Math.random().toString(36).slice(2),
  );
  let repo: LocalSessionRepository;

  beforeEach(() => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    repo = new LocalSessionRepository(dataDir);
  });

  afterEach(() => {
    fs.rmSync(dataDir, { recursive: true, force: true });
  });

  it('should create and retrieve a session', async () => {
    const session = {
      id: 'session_1' as SessionId,
      userId: 'user_1' as UserId,
      tokenHash: 'hash_123',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10000).toISOString(),
    };

    const res = await repo.create(session);
    expect(res.ok).toBe(true);

    const found = await repo.findById(session.id);
    expect(found).toEqual(session);

    const byToken = await repo.findByTokenHash('hash_123');
    expect(byToken).toEqual(session);
  });
});
