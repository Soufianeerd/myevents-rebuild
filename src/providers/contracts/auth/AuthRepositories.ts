import { UserId } from '../../../core/ids';
import { User, Session, PasswordResetToken } from '../../../core/auth';
import { Result } from '../../../core/result';
import { AppError } from '../../../core/errors';

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(normalizedEmail: string): Promise<User | null>;
  create(user: User): Promise<Result<void, AppError>>;
  update(user: User): Promise<Result<void, AppError>>;
}

export interface SessionRepository {
  findById(id: string): Promise<Session | null>;
  findByTokenHash(tokenHash: string): Promise<Session | null>;
  create(session: Session): Promise<Result<void, AppError>>;
  revoke(id: string): Promise<Result<void, AppError>>;
  revokeAllUserSessions(userId: UserId): Promise<Result<void, AppError>>;
  deleteExpired(now: string): Promise<Result<void, AppError>>;
}

export interface PasswordResetRepository {
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  create(token: PasswordResetToken): Promise<Result<void, AppError>>;
  consumeValidToken(
    tokenHash: string,
    now: string,
  ): Promise<Result<PasswordResetToken, AppError>>;
}
