import { z } from 'zod';
import { LocalJsonStore } from '../persistence/LocalJsonStore';
import { PasswordResetRepository } from '../../contracts/auth/AuthRepositories';
import { PasswordResetToken } from '../../../core/auth';
import { UserId } from '../../../core/ids';
import { PasswordResetTokenId } from '../../../core/auth';
import { Result, ok, err } from '../../../core/result';
import { AppError, createAppError } from '../../../core/errors';

const PasswordResetSchema = z.object({
  id: z.string().transform((val) => val as PasswordResetTokenId),
  userId: z.string().transform((val) => val as UserId),
  tokenHash: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  usedAt: z.string().optional(),
});

const PasswordResetsSchema = z.record(z.string(), PasswordResetSchema);
type PasswordResetsMap = z.infer<typeof PasswordResetsSchema>;

export class LocalPasswordResetRepository implements PasswordResetRepository {
  private store: LocalJsonStore<PasswordResetsMap>;

  constructor(dataDir: string) {
    this.store = new LocalJsonStore<PasswordResetsMap>({
      baseDir: dataDir,
      collectionName: 'password-resets',
      schema: PasswordResetsSchema,
    });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const resets = (await this.store.read()) || {};
    return (
      Object.values(resets).find((token) => token.tokenHash === tokenHash) ||
      null
    );
  }

  async create(token: PasswordResetToken): Promise<Result<void, AppError>> {
    await this.store.update((data) => {
      const resets = data || {};
      resets[token.id] = token;
      return resets;
    });
    return ok(undefined);
  }

  async consumeValidToken(
    tokenHash: string,
    now: string,
  ): Promise<Result<PasswordResetToken, AppError>> {
    let consumedToken: PasswordResetToken | null = null;
    let failureError: AppError | null = null;

    await this.store.update((data) => {
      const resets = data || {};
      const token = Object.values(resets).find(
        (t) => t.tokenHash === tokenHash,
      );

      if (!token) {
        failureError = createAppError('NOT_FOUND', 'Token not found.');
        return resets;
      }

      if (token.usedAt) {
        failureError = createAppError(
          'VALIDATION_ERROR',
          'Token already used.',
          400,
        );
        return resets;
      }

      if (token.expiresAt < now) {
        failureError = createAppError(
          'VALIDATION_ERROR',
          'Token expired.',
          400,
        );
        return resets;
      }

      // Mark as used
      token.usedAt = now;
      consumedToken = { ...token };
      return resets;
    });

    if (failureError) {
      return err(failureError);
    }

    // We know consumedToken is not null here if there's no failureError
    return ok(consumedToken!);
  }
}
