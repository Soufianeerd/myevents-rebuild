import * as crypto from 'node:crypto';
import { promisify } from 'node:util';
import {
  PasswordHasher,
  PasswordHashInfo,
} from '../../../providers/contracts/auth/PasswordHasher';

const scryptAsync = promisify(crypto.scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: crypto.ScryptOptions,
) => Promise<Buffer>;

export class ScryptPasswordHasher implements PasswordHasher {
  // OWASP recommended settings for scrypt (as of 2023)
  private readonly defaultParams = {
    N: 65536, // CPU/memory cost parameter (2^16)
    r: 8, // Block size parameter
    p: 2, // Parallelization parameter
  };
  private readonly keyLength = 64; // 64 bytes for scrypt derived key

  async hash(password: string): Promise<PasswordHashInfo> {
    const salt = crypto.randomBytes(32).toString('base64');

    const derivedKey = (await scryptAsync(password, salt, this.keyLength, {
      ...this.defaultParams,
      maxmem: 268435456,
    })) as Buffer;

    return {
      hash: derivedKey.toString('base64'),
      salt,
      algorithm: 'scrypt',
      params: this.defaultParams,
    };
  }

  async verify(password: string, stored: PasswordHashInfo): Promise<boolean> {
    if (stored.algorithm !== 'scrypt') {
      return false;
    }

    try {
      const derivedKey = (await scryptAsync(
        password,
        stored.salt,
        this.keyLength,
        { ...stored.params, maxmem: 268435456 },
      )) as Buffer;
      const storedKey = Buffer.from(stored.hash, 'base64');

      // Prevent timing attacks
      return crypto.timingSafeEqual(derivedKey, storedKey);
    } catch {
      return false;
    }
  }
}
