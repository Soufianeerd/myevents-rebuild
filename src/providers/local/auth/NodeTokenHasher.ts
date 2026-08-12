import * as crypto from 'node:crypto';
import { TokenHasher } from '../../contracts/auth/TokenHasher';

export class NodeTokenHasher implements TokenHasher {
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('base64');
  }
}
