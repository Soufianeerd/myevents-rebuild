import * as crypto from 'node:crypto';
import type { IdGenerator } from '../../contracts/IdGenerator';

export class CryptoIdGenerator implements IdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
