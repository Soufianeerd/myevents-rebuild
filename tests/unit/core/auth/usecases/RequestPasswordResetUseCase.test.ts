import { describe, it, expect, vi } from 'vitest';
import { RequestPasswordResetUseCase } from '../../../../../src/core/auth/usecases/requestPasswordReset';
import {
  UserRepository,
  PasswordResetRepository,
} from '../../../../../src/providers/contracts/auth/AuthRepositories';
import { MailProvider } from '../../../../../src/providers/contracts/auth/MailProvider';
import { SecretTokenProvider } from '../../../../../src/providers/contracts/auth/SecretTokenProvider';
import { TokenHasher } from '../../../../../src/providers/contracts/auth/TokenHasher';
import { AppUrlProvider } from '../../../../../src/providers/contracts/auth/AppUrlProvider';
import { Clock } from '../../../../../src/providers/contracts/Clock';
import { IdGenerator } from '../../../../../src/providers/contracts/IdGenerator';
import { ok } from '../../../../../src/core/result';

describe('RequestPasswordResetUseCase', () => {
  it('should generate token, save it, and send email if user exists', async () => {
    const mockUserRepo: UserRepository = {
      findByEmail: vi
        .fn()
        .mockResolvedValue({ id: 'user1', email: 'test@example.com' }),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    const mockResetRepo: PasswordResetRepository = {
      findByTokenHash: vi.fn(),
      create: vi.fn().mockResolvedValue(ok(undefined)),
      consumeValidToken: vi.fn(),
    };
    const mockMail: MailProvider = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue(ok(undefined)),
    };
    const mockSecret: SecretTokenProvider = {
      generateToken: vi.fn().mockReturnValue('secret_token'),
    };
    const mockHasher: TokenHasher = {
      hashToken: vi.fn().mockReturnValue('hashed_token'),
    };
    const mockUrl: AppUrlProvider = {
      getAppUrl: vi.fn().mockReturnValue('http://localhost:3000'),
    };
    const mockClock: Clock = { now: vi.fn().mockReturnValue(new Date(100000)) };
    const mockId: IdGenerator = { generate: vi.fn().mockReturnValue('reset1') };

    const usecase = new RequestPasswordResetUseCase(
      mockUserRepo,
      mockResetRepo,
      mockMail,
      mockHasher,
      mockSecret,
      mockUrl,
      mockId,
      mockClock,
    );
    const result = await usecase.execute({ email: 'test@example.com' });

    expect(result.ok).toBe(true);
    expect(mockResetRepo.create).toHaveBeenCalled();
    expect(mockMail.sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
      'http://localhost:3000/reinitialiser-mot-de-passe?token=secret_token',
    );
  });

  it('should return ok even if user is not found (prevent enumeration)', async () => {
    const mockUserRepo: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    const mockResetRepo: PasswordResetRepository = {
      findByTokenHash: vi.fn(),
      create: vi.fn(),
      consumeValidToken: vi.fn(),
    };
    const mockMail: MailProvider = { sendPasswordResetEmail: vi.fn() };
    const mockSecret: SecretTokenProvider = { generateToken: vi.fn() };
    const mockHasher: TokenHasher = { hashToken: vi.fn() };
    const mockUrl: AppUrlProvider = { getAppUrl: vi.fn() };
    const mockClock: Clock = { now: vi.fn() };
    const mockId: IdGenerator = { generate: vi.fn() };

    const usecase = new RequestPasswordResetUseCase(
      mockUserRepo,
      mockResetRepo,
      mockMail,
      mockHasher,
      mockSecret,
      mockUrl,
      mockId,
      mockClock,
    );
    const result = await usecase.execute({ email: 'notfound@example.com' });

    expect(result.ok).toBe(true);
    expect(mockResetRepo.create).not.toHaveBeenCalled();
    expect(mockMail.sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});
