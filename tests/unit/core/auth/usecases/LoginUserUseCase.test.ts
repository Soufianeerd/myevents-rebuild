import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { User } from '../../../../../src/core/auth/models';
import { PasswordHashInfo } from '../../../../../src/providers/contracts/auth/PasswordHasher';
import { LoginUserUseCase } from '../../../../../src/core/auth/usecases/loginUser';
import { UserId } from '../../../../../src/core/ids';
import {
  UserRepository,
  SessionRepository,
} from '../../../../../src/providers/contracts/auth/AuthRepositories';
import { PasswordHasher } from '../../../../../src/providers/contracts/auth/PasswordHasher';
import { TokenHasher } from '../../../../../src/providers/contracts/auth/TokenHasher';
import { SecretTokenProvider } from '../../../../../src/providers/contracts/auth/SecretTokenProvider';
import { IdGenerator } from '../../../../../src/providers/contracts/IdGenerator';
import { Clock } from '../../../../../src/providers/contracts/Clock';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockUserRepo: Mocked<UserRepository>;
  let mockSessionRepo: Mocked<SessionRepository>;
  let mockPasswordHasher: Mocked<PasswordHasher>;
  let mockTokenHasher: Mocked<TokenHasher>;
  let mockSecretTokenProvider: Mocked<SecretTokenProvider>;
  let mockIdGenerator: Mocked<IdGenerator>;
  let mockClock: Mocked<Clock>;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    } as unknown as Mocked<UserRepository>;
    mockSessionRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      revokeAllUserSessions: vi.fn(),
      deleteExpired: vi.fn(),
      findByTokenHash: vi.fn(),
      revoke: vi.fn(),
    } as unknown as Mocked<SessionRepository>;
    mockPasswordHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    } as unknown as Mocked<PasswordHasher>;
    mockTokenHasher = {
      hashToken: vi.fn().mockReturnValue('hashed_token'),
    } as unknown as Mocked<TokenHasher>;
    mockSecretTokenProvider = {
      generateToken: vi.fn().mockReturnValue('secret_token'),
    } as unknown as Mocked<SecretTokenProvider>;
    mockIdGenerator = {
      generate: vi.fn().mockReturnValue('generated_id'),
    } as unknown as Mocked<IdGenerator>;
    mockClock = {
      now: vi.fn().mockReturnValue(new Date('2025-01-01T00:00:00Z')),
    } as unknown as Mocked<Clock>;

    useCase = new LoginUserUseCase(
      mockUserRepo,
      mockSessionRepo,
      mockPasswordHasher,
      mockTokenHasher,
      mockSecretTokenProvider,
      mockIdGenerator,
      mockClock,
    );
  });

  it('should successfully login and generate a session', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 'user_1' as UserId,
      passwordHashInfo: {
        hash: 'hash',
        salt: 'salt',
        algorithm: 'scrypt',
        params: {},
      },
    } as unknown as User);
    mockPasswordHasher.verify.mockResolvedValue(true);
    mockSessionRepo.create.mockResolvedValue({
      ok: true,
      value: undefined,
    } as never);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.ok).toBe(true);
    expect(mockSessionRepo.create).toHaveBeenCalled();
  });

  it('should perform dummy hash and return error when user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue(
      {} as unknown as PasswordHashInfo,
    );

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.ok).toBe(false);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
      'dummy_timing_protection_password',
    );
  });

  it('should return error when password is wrong', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 'user_1' as UserId,
      passwordHashInfo: {
        hash: 'hash',
        salt: 'salt',
        algorithm: 'scrypt',
        params: {},
      },
    } as unknown as User);
    mockPasswordHasher.verify.mockResolvedValue(false);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.ok).toBe(false);
  });
});
