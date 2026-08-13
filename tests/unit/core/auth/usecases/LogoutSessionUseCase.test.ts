import { describe, it, expect, vi } from 'vitest';
import { LogoutSessionUseCase } from '../../../../../src/core/auth/usecases/logoutSession';
import { SessionRepository } from '../../../../../src/providers/contracts/auth/AuthRepositories';
import { TokenHasher } from '../../../../../src/providers/contracts/auth/TokenHasher';
import { ok } from '../../../../../src/core/result';

describe('LogoutSessionUseCase', () => {
  it('should hash the token, find the session, and revoke it', async () => {
    const mockRepo: SessionRepository = {
      findById: vi.fn(),
      findByTokenHash: vi
        .fn()
        .mockResolvedValue({ id: 'session_123', userId: 'user_123' }),
      create: vi.fn(),
      revoke: vi.fn().mockResolvedValue(ok(undefined)),
      revokeAllUserSessions: vi.fn(),
      deleteExpired: vi.fn(),
    };

    const mockHasher: TokenHasher = {
      hashToken: vi.fn().mockReturnValue('hashed_token'),
    };

    const usecase = new LogoutSessionUseCase(mockRepo, mockHasher);
    await usecase.execute('raw_token_xyz');

    expect(mockHasher.hashToken).toHaveBeenCalledWith('raw_token_xyz');
    expect(mockRepo.findByTokenHash).toHaveBeenCalledWith('hashed_token');
    expect(mockRepo.revoke).toHaveBeenCalledWith('session_123');
  });

  it('should do nothing if session is not found', async () => {
    const mockRepo: SessionRepository = {
      findById: vi.fn(),
      findByTokenHash: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      revoke: vi.fn(),
      revokeAllUserSessions: vi.fn(),
      deleteExpired: vi.fn(),
    };

    const mockHasher: TokenHasher = {
      hashToken: vi.fn().mockReturnValue('hashed_token'),
    };

    const usecase = new LogoutSessionUseCase(mockRepo, mockHasher);
    await usecase.execute('raw_token_xyz');

    expect(mockRepo.revoke).not.toHaveBeenCalled();
  });
});
