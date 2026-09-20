import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { attachDatabasePool } from '@vercel/functions';
import { z } from 'zod';
import { env } from '@/lib/env';
import type { ScopedDatabase } from '@/providers/neon/database';

let pool: Pool | undefined;
function database() {
  if (!env.DATABASE_URL) throw new Error('Neon database is not configured.');
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 15000,
    });
    pool.on('error', () => console.error('Neon connection unavailable.'));
    attachDatabasePool(pool);
  }
  return drizzle(pool);
}
export interface NeonSessionClaims {
  userId: string;
  sessionId: string;
}
export function scopedNeonDatabase(
  claims: NeonSessionClaims | null,
): ScopedDatabase {
  if (claims) {
    z.uuid().parse(claims.userId);
    z.uuid().parse(claims.sessionId);
  }
  return {
    async query(statement) {
      try {
        return await database().transaction(async (tx) => {
          await tx.execute(
            sql`SELECT set_config('myevents.neon_user_id',${claims?.userId ?? ''},true),set_config('myevents.neon_session_id',${claims?.sessionId ?? ''},true)`,
          );
          const result = await tx.execute(statement);
          return result.rows;
        });
      } catch {
        // Driver errors can contain SQL values and connection information.
        throw new Error('Neon operation failed or access was denied.');
      }
    },
  };
}
