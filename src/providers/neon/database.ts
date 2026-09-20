import type { SQL } from 'drizzle-orm';

// Implementations must execute each operation in a transaction with claims
// derived from a verified server session, never from form or URL parameters.
export interface ScopedDatabase {
  query(statement: SQL): Promise<Record<string, unknown>[]>;
}
