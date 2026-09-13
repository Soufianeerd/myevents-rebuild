import { z } from 'zod';
import type { AuthAttemptLimiter } from '../../contracts/auth/AuthAttemptLimiter';
import type { Clock } from '../../contracts/Clock';
import { LocalJsonStore } from '../persistence/LocalJsonStore';

const schema = z.record(
  z.string(),
  z.object({ count: z.number().int(), expiresAt: z.number() }),
);

export class LocalAuthAttemptLimiter implements AuthAttemptLimiter {
  private store: LocalJsonStore<z.infer<typeof schema>>;
  constructor(
    dataDir: string,
    private clock: Clock,
  ) {
    this.store = new LocalJsonStore({
      baseDir: dataDir,
      collectionName: 'auth-attempts',
      schema,
    });
  }

  async allow(key: string, limit: number, windowMs: number): Promise<boolean> {
    let allowed = false;
    const now = this.clock.now().getTime();
    await this.store.update((data) => {
      const entries = Object.fromEntries(
        Object.entries(data || {}).filter(([, entry]) => entry.expiresAt > now),
      );
      const entry = entries[key] || { count: 0, expiresAt: now + windowMs };
      if (entry.count < limit) {
        entry.count += 1;
        entries[key] = entry;
        allowed = true;
      }
      return entries;
    });
    return allowed;
  }
}
