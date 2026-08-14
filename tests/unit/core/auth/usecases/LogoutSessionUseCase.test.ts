import { describe, it, expect, vi } from 'vitest';
import { LogoutSessionUseCase } from '../../../../../src/core/auth/usecases/logoutSession';
import { SessionRepository } from '../../../../../src/providers/contracts/auth/AuthRepositories';
import { TokenHasher } from '../../../../../src/providers/contracts/auth/TokenHasher';
import { ok, err } from '../../../../../src/core/result';
import { createAppError } from '../../../../../src/core/errors';

describe('LogoutSessionUseCase', () => {
  it('should revoke the session if found by token hash', async () => {
    const sessionRepository = {
      findByTokenHash: vi.fn().mockResolvedValue({ id: 'session-123' }),
      revoke: vi.fn().mockResolvedValue(ok(undefined)),
    } as unknown as SessionRepository;
    const tokenHasher = {
      hashToken: vi.fn().mockReturnValue('hashed-token'),
    } as unknown as TokenHasher;

    const useCase = new LogoutSessionUseCase(sessionRepository, tokenHasher);

    const result = await useCase.execute('raw-token');

    expect(tokenHasher.hashToken).toHaveBeenCalledWith('raw-token');
    expect(sessionRepository.findByTokenHash).toHaveBeenCalledWith(
      'hashed-token',
    );
    expect(sessionRepository.revoke).toHaveBeenCalledWith('session-123');
    expect(result.ok).toBe(true);
  });

  it('should succeed even if session is not found (idempotent)', async () => {
    const sessionRepository = {
      findByTokenHash: vi.fn().mockResolvedValue(null),
      revoke: vi.fn(),
    } as unknown as SessionRepository;
    const tokenHasher = {
      hashToken: vi.fn().mockReturnValue('hashed-token'),
    } as unknown as TokenHasher;

    const useCase = new LogoutSessionUseCase(sessionRepository, tokenHasher);

    const result = await useCase.execute('raw-token');

    expect(tokenHasher.hashToken).toHaveBeenCalledWith('raw-token');
    expect(sessionRepository.findByTokenHash).toHaveBeenCalledWith(
      'hashed-token',
    );
    expect(sessionRepository.revoke).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
  });

  it('should return error if revoke fails', async () => {
    const dbError = createAppError('PERSISTENCE_ERROR', 'DB Failed');
    const sessionRepository = {
      findByTokenHash: vi.fn().mockResolvedValue({ id: 'session-123' }),
      revoke: vi.fn().mockResolvedValue(err(dbError)),
    } as unknown as SessionRepository;
    const tokenHasher = {
      hashToken: vi.fn().mockReturnValue('hashed-token'),
    } as unknown as TokenHasher;

    const useCase = new LogoutSessionUseCase(sessionRepository, tokenHasher);

    const result = await useCase.execute('raw-token');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(dbError);
    }
  });
});
