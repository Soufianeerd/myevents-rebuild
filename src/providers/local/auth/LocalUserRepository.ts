import { z } from 'zod';
import { LocalJsonStore } from '../persistence/LocalJsonStore';
import { UserRepository } from '../../contracts/auth/AuthRepositories';
import { User } from '../../../core/auth';
import { UserId, TenantId } from '../../../core/ids';
import { Result, ok, err } from '../../../core/result';
import { AppError, createAppError } from '../../../core/errors';

// Zod schema matching the User interface
const UserSchema = z.object({
  id: z.string().transform((val) => val as UserId),
  tenantId: z.string().transform((val) => val as TenantId),
  email: z.string().email(),
  displayName: z.string().min(1),
  passwordHash: z.string(),
  passwordSalt: z.string(),
  passwordAlgorithm: z.string(),
  passwordParams: z.object({
    N: z.number(),
    r: z.number(),
    p: z.number(),
  }),
  passwordUpdatedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const UsersSchema = z.record(z.string(), UserSchema);
type UsersMap = z.infer<typeof UsersSchema>;

export class LocalUserRepository implements UserRepository {
  private store: LocalJsonStore<UsersMap>;

  constructor(dataDir: string) {
    this.store = new LocalJsonStore<UsersMap>({
      baseDir: dataDir,
      collectionName: 'users',
      schema: UsersSchema,
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const users = (await this.store.read()) || {};
    return users[id] || null;
  }

  async findByEmail(normalizedEmail: string): Promise<User | null> {
    const users = (await this.store.read()) || {};
    return (
      Object.values(users).find((user) => user.email === normalizedEmail) ||
      null
    );
  }

  async create(user: User): Promise<Result<void, AppError>> {
    let conflictError: AppError | null = null;
    await this.store.update((data) => {
      const users = data || {};

      const existingEmail = Object.values(users).find(
        (u) => u.email === user.email,
      );
      if (existingEmail) {
        conflictError = createAppError(
          'CONFLICT',
          'This email is already in use.',
        );
        return users;
      }

      if (users[user.id]) {
        conflictError = createAppError('CONFLICT', 'User ID already exists.');
        return users;
      }

      users[user.id] = user;
      return users;
    });

    if (conflictError) {
      return err(conflictError);
    }

    return ok(undefined);
  }

  async update(user: User): Promise<Result<void, AppError>> {
    let notFoundError: AppError | null = null;
    await this.store.update((data) => {
      const users = data || {};

      if (!users[user.id]) {
        notFoundError = createAppError('NOT_FOUND', 'User not found.');
        return users;
      }

      users[user.id] = user;
      return users;
    });

    if (notFoundError) {
      return err(notFoundError);
    }

    return ok(undefined);
  }
}
