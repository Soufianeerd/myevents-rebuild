import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { RegisterUserUseCase } from '../../../../../src/core/auth/usecases/registerUser';
import { User } from '../../../../../src/core/auth/models';
import {
  UserRepository,
  SessionRepository,
} from '../../../../../src/providers/contracts/auth/AuthRepositories';
import { PasswordHasher } from '../../../../../src/providers/contracts/auth/PasswordHasher';
import { TokenHasher } from '../../../../../src/providers/contracts/auth/TokenHasher';
import { SecretTokenProvider } from '../../../../../src/providers/contracts/auth/SecretTokenProvider';
import { IdGenerator } from '../../../../../src/providers/contracts/IdGenerator';
import { Clock } from '../../../../../src/providers/contracts/Clock';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
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
      hash: vi.fn().mockResolvedValue({
        hash: 'hashed_pw',
        salt: 'salt',
        algorithm: 'scrypt',
        params: {},
      }),
      verify: vi.fn(),
    } as unknown as Mocked<PasswordHasher>;
    mockTokenHasher = {
      hashToken: vi.fn().mockReturnValue('hashed_token'),
    };
    mockSecretTokenProvider = {
      generateToken: vi.fn().mockReturnValue('secret_token'),
    };
    mockIdGenerator = {
      generate: vi.fn().mockReturnValue('generated_id'),
    } as unknown as Mocked<IdGenerator>;
    mockClock = {
      now: vi.fn().mockReturnValue(new Date('2025-01-01T00:00:00Z')),
    };

    useCase = new RegisterUserUseCase(
      mockUserRepo,
      mockSessionRepo,
      mockPasswordHasher,
      mockTokenHasher,
      mockSecretTokenProvider,
      mockIdGenerator,
      mockClock,
    );
  });

  it('should register a user successfully', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.create.mockResolvedValue({
      ok: true,
      value: undefined,
    } as never);
    mockSessionRepo.create.mockResolvedValue({
      ok: true,
      value: undefined,
    } as never);

    const result = await useCase.execute({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'StrongPassword123!',
      passwordConfirmation: 'StrongPassword123!',
    });

    expect(result.ok).toBe(true);
    expect(mockUserRepo.create).toHaveBeenCalled();
    expect(mockSessionRepo.create).toHaveBeenCalled();
    if (result.ok) {
      expect(result.value.user.email).toBe('john@example.com');
      expect(result.value.user.firstName).toBe('John');
      expect(result.value.user.lastName).toBe('Doe');
      expect(result.value.rawSessionToken).toBe('secret_token');
    }
  });

  it('should fail if email is already used', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: '123',
    } as unknown as User);

    const result = await useCase.execute({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'StrongPassword123!',
      passwordConfirmation: 'StrongPassword123!',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('CONFLICT');
    }
  });
});
