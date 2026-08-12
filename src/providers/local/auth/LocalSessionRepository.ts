import { z } from 'zod';
import { LocalJsonStore } from '../persistence/LocalJsonStore';
import { SessionRepository } from '../../contracts/auth/AuthRepositories';
import { Session } from '../../../core/auth';
import { UserId } from '../../../core/ids';
import { SessionId } from '../../../core/auth';
import { Result, ok } from '../../../core/result';
import { AppError } from '../../../core/errors';

const SessionSchema = z.object({
  id: z.string().transform((val) => val as SessionId),
  userId: z.string().transform((val) => val as UserId),
  tokenHash: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  lastSeenAt: z.string().optional(),
});

const SessionsSchema = z.record(z.string(), SessionSchema);
type SessionsMap = z.infer<typeof SessionsSchema>;

export class LocalSessionRepository implements SessionRepository {
  private store: LocalJsonStore<SessionsMap>;

  constructor(dataDir: string) {
    this.store = new LocalJsonStore<SessionsMap>({
      baseDir: dataDir,
      collectionName: 'sessions',
      schema: SessionsSchema,
    });
  }

  async findById(id: string): Promise<Session | null> {
    const sessions = (await this.store.read()) || {};
    return sessions[id] || null;
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const sessions = (await this.store.read()) || {};
    return (
      Object.values(sessions).find(
        (session) => session.tokenHash === tokenHash,
      ) || null
    );
  }

  async create(session: Session): Promise<Result<void, AppError>> {
    await this.store.update((data) => {
      const sessions = data || {};
      sessions[session.id] = session;
      return sessions;
    });
    return ok(undefined);
  }

  async revoke(id: string): Promise<Result<void, AppError>> {
    await this.store.update((data) => {
      const sessions = data || {};
      if (sessions[id]) {
        delete sessions[id];
      }
      return sessions;
    });
    return ok(undefined);
  }

  async revokeAllUserSessions(userId: UserId): Promise<Result<void, AppError>> {
    await this.store.update((data) => {
      const sessions = data || {};
      for (const id of Object.keys(sessions)) {
        if (sessions[id].userId === userId) {
          delete sessions[id];
        }
      }
      return sessions;
    });
    return ok(undefined);
  }

  async deleteExpired(now: string): Promise<Result<void, AppError>> {
    await this.store.update((data) => {
      const sessions = data || {};
      for (const id of Object.keys(sessions)) {
        if (sessions[id].expiresAt < now) {
          delete sessions[id];
        }
      }
      return sessions;
    });
    return ok(undefined);
  }
}
