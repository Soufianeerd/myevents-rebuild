import { describe, it, expect, vi } from 'vitest';
import { ResetPasswordUseCase } from '../../../../../src/core/auth/usecases/resetPassword';
import {
  UserRepository,
  PasswordResetRepository,
  SessionRepository,
} from '../../../../../src/providers/contracts/auth/AuthRepositories';
import { PasswordHasher } from '../../../../../src/providers/contracts/auth/PasswordHasher';
import { TokenHasher } from '../../../../../src/providers/contracts/auth/TokenHasher';
import { Clock } from '../../../../../src/providers/contracts/Clock';
import { ok } from '../../../../../src/core/result';

describe('ResetPasswordUseCase', () => {
  it('should reset password, revoke sessions, and consume token if valid', async () => {
    const mockUserRepo: UserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: 'user1' }),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(ok(undefined)),
    };
    const mockResetRepo: PasswordResetRepository = {
      create: vi.fn(),
      consumeValidToken: vi.fn().mockResolvedValue(ok({ userId: 'user1' })),
      findByTokenHash: vi.fn(),
    };
    const mockSessionRepo: SessionRepository = {
      findById: vi.fn(),
      findByTokenHash: vi.fn(),
      create: vi.fn(),
      revoke: vi.fn(),
      revokeAllUserSessions: vi.fn().mockResolvedValue(ok(undefined)),
      deleteExpired: vi.fn(),
    };
    const mockPassHasher: PasswordHasher = {
      hash: vi.fn().mockResolvedValue({
        hash: 'new_hash',
        salt: 'salt',
        algorithm: 'scrypt',
        params: {},
      }),
      verify: vi.fn(),
    };
    const mockTokenHasher: TokenHasher = {
      hashToken: vi.fn().mockReturnValue('hashed_token'),
    };
    const mockClock: Clock = { now: vi.fn().mockReturnValue(new Date(100000)) };

    const usecase = new ResetPasswordUseCase(
      mockUserRepo,
      mockSessionRepo,
      mockResetRepo,
      mockPassHasher,
      mockTokenHasher,
      mockClock,
    );
    for (const password of ['TooShort123', 'x'.repeat(129)]) {
      const invalid = await usecase.execute({
        rawResetToken: 'raw_token',
        newPassword: password,
      });
      expect(invalid.ok).toBe(false);
    }
    expect(mockResetRepo.consumeValidToken).not.toHaveBeenCalled();
    expect(mockPassHasher.hash).not.toHaveBeenCalled();
    const result = await usecase.execute({
      rawResetToken: 'raw_token',
      newPassword: 'NewStrongPassword123!',
    });

    expect(result.ok).toBe(true);
    expect(mockResetRepo.consumeValidToken).toHaveBeenCalledWith(
      'hashed_token',
      expect.any(String),
    );
    expect(mockPassHasher.hash).toHaveBeenCalledWith('NewStrongPassword123!');
    expect(mockUserRepo.update).toHaveBeenCalled();
    expect(mockSessionRepo.revokeAllUserSessions).toHaveBeenCalledWith('user1');
  });
});
