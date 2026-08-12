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

  async markAsUsed(
    id: string,
    usedAt: string,
  ): Promise<Result<void, AppError>> {
    let notFoundError: AppError | null = null;
    await this.store.update((data) => {
      const resets = data || {};
      const token = resets[id];

      if (!token) {
        notFoundError = createAppError('NOT_FOUND', 'Reset token not found.');
        return resets;
      }

      token.usedAt = usedAt;
      return resets;
    });

    if (notFoundError) {
      return err(notFoundError);
    }
    return ok(undefined);
  }
}
