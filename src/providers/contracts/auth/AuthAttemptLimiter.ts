export interface AuthAttemptLimiter {
  /** Atomically reserve an attempt; key is opaque and contains no raw identity. */
  allow(key: string, limit: number, windowMs: number): Promise<boolean>;
}
